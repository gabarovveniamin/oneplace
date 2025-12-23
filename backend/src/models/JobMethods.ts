import { query } from '../config/database';
import { Job, UpdateJobData } from './Job';

export class JobModelMethods {
  // Обновление вакансии
  static async update(id: string, jobData: UpdateJobData): Promise<Job | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const fieldMappings = {
      title: 'title',
      company: 'company',
      salary: 'salary',
      location: 'location',
      type: 'type',
      description: 'description',
      tags: 'tags',
      logo: 'logo',
      specialization: 'specialization',
      industry: 'industry',
      region: 'region',
      salaryFrom: 'salary_from',
      salaryTo: 'salary_to',
      salaryFrequency: 'salary_frequency',
      education: 'education',
      experience: 'experience',
      employmentType: 'employment_type',
      schedule: 'schedule',
      workHours: 'work_hours',
      workFormat: 'work_format',
      isActive: 'is_active',
      isFeatured: 'is_featured',
    };

    Object.entries(jobData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = fieldMappings[key as keyof typeof fieldMappings];
        if (dbField) {
          fields.push(`${dbField} = $${fields.length + 1}`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    await query(
      `UPDATE jobs 
       SET ${fields.join(', ')}
       WHERE id = $${values.length}`,
      values
    );

    // Получаем обновленную вакансию
    const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToJob(result.rows[0]);
  }

  // Удаление вакансии
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM jobs WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Увеличение счетчика просмотров
  static async incrementViews(id: string): Promise<void> {
    await query('UPDATE jobs SET views = views + 1 WHERE id = $1', [id]);
  }

  // Получение популярных вакансий
  static async getPopular(limit = 10): Promise<Job[]> {
    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.is_active = TRUE
       ORDER BY j.views DESC, j.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => this.mapRowToJobWithUser(row));
  }

  // Получение недавних вакансий
  static async getRecent(limit = 10): Promise<Job[]> {
    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.is_active = TRUE
       ORDER BY j.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => this.mapRowToJobWithUser(row));
  }

  // Получение статистики
  static async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    const [totalResult, byTypeResult, byIndustryResult, byRegionResult] = await Promise.all([
      query('SELECT COUNT(*) as total FROM jobs WHERE is_active = TRUE'),
      query('SELECT type, COUNT(*) as count FROM jobs WHERE is_active = TRUE GROUP BY type'),
      query('SELECT industry, COUNT(*) as count FROM jobs WHERE is_active = TRUE AND industry IS NOT NULL GROUP BY industry'),
      query('SELECT region, COUNT(*) as count FROM jobs WHERE is_active = TRUE AND region IS NOT NULL GROUP BY region'),
    ]);

    const byType = byTypeResult.rows.reduce((acc: Record<string, number>, row: Record<string, any>) => ({ ...acc, [row.type]: parseInt(row.count) }), {});
    const byIndustry = byIndustryResult.rows.reduce((acc: Record<string, number>, row: Record<string, any>) => ({ ...acc, [row.industry]: parseInt(row.count) }), {});
    const byRegion = byRegionResult.rows.reduce((acc: Record<string, number>, row: Record<string, any>) => ({ ...acc, [row.region]: parseInt(row.count) }), {});

    return {
      total: parseInt(totalResult.rows[0].total),
      byType,
      byIndustry,
      byRegion,
    };
  }

  // Получение вакансий пользователя
  static async findByUserId(userId: string): Promise<Job[]> {
    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.posted_by = $1
       ORDER BY j.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => this.mapRowToJobWithUser(row));
  }

  // Маппинг строки БД в объект Job
  private static mapRowToJob(row: Record<string, any>): Job {
    const createdDate = new Date(row.created_at);
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      salary: row.salary,
      location: row.location,
      type: row.type,
      description: row.description,
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
      logo: row.logo,
      specialization: row.specialization,
      industry: row.industry,
      region: row.region,
      salaryFrom: row.salary_from,
      salaryTo: row.salary_to,
      salaryFrequency: row.salary_frequency,
      education: row.education,
      experience: row.experience,
      employmentType: row.employment_type,
      schedule: row.schedule,
      workHours: row.work_hours,
      workFormat: row.work_format,
      postedBy: row.posted_by,
      isActive: Boolean(row.is_active),
      isFeatured: Boolean(row.is_featured),
      views: row.views,
      applications: row.applications,
      expiresAt: new Date(row.expires_at),
      postedAt: createdDate.toLocaleDateString('ru-RU'),
      createdAt: createdDate,
      updatedAt: new Date(row.updated_at),
    };
  }

  // Маппинг строки БД в объект Job с пользователем
  private static mapRowToJobWithUser(row: Record<string, any>): Job {
    const job = this.mapRowToJob(row);
    if (row.posted_by_id) {
      job.postedByUser = {
        id: row.posted_by_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
      };
    }
    return job;
  }
}
