import { query } from '../config/database';

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'daily' | 'projects' | 'travel';
  description: string;
  tags: string[];
  logo?: string;

  // Extended fields
  specialization?: string;
  industry?: string;
  region?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryFrequency?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  education?: 'no-education' | 'secondary' | 'vocational' | 'bachelor' | 'master' | 'phd';
  experience?: 'no-experience' | '1-year' | '1-3-years' | '3-5-years' | '5-10-years' | '10-plus-years';
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  schedule?: 'flexible' | 'fixed' | 'shift' | 'night' | 'weekend';
  workHours?: number;
  workFormat?: 'office' | 'remote' | 'hybrid';

  // Metadata
  postedBy: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  applications: number;
  expiresAt: Date;
  postedAt: string;
  createdAt: Date;
  updatedAt: Date;

  // Populated fields
  postedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateJobData {
  title: string;
  company: string;
  salary: string;
  location: string;
  type: string;
  description: string;
  tags?: string[];
  logo?: string;
  specialization?: string;
  industry?: string;
  region?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryFrequency?: string;
  education?: string;
  experience?: string;
  employmentType?: string;
  schedule?: string;
  workHours?: number;
  workFormat?: string;
  postedBy: string;
}

export interface UpdateJobData {
  title?: string;
  company?: string;
  salary?: string;
  location?: string;
  type?: string;
  description?: string;
  tags?: string[];
  logo?: string;
  specialization?: string;
  industry?: string;
  region?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryFrequency?: string;
  education?: string;
  experience?: string;
  employmentType?: string;
  schedule?: string;
  workHours?: number;
  workFormat?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface JobFilters {
  keyword?: string;
  type?: string;
  location?: string;
  specialization?: string;
  industry?: string;
  region?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryFrequency?: string;
  education?: string;
  experience?: string;
  employmentType?: string;
  schedule?: string;
  workHours?: number;
  workFormat?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}



export class JobModel {
  // Создание вакансии
  static async create(jobData: CreateJobData): Promise<Job> {
    const result = await query(
      `INSERT INTO jobs (
        title, company, salary, location, type, description, tags, logo,
        specialization, industry, region, salary_from, salary_to, salary_frequency,
        education, experience, employment_type, schedule, work_hours, work_format,
        posted_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id`,
      [
        jobData.title, jobData.company, jobData.salary, jobData.location, jobData.type,
        jobData.description, JSON.stringify(jobData.tags || []), jobData.logo || null, jobData.specialization || null,
        jobData.industry || null, jobData.region || null, jobData.salaryFrom || null, jobData.salaryTo || null,
        jobData.salaryFrequency || null, jobData.education || null, jobData.experience || null,
        jobData.employmentType || null, jobData.schedule || null, jobData.workHours || null,
        jobData.workFormat || null, jobData.postedBy
      ]
    );

    const id = result.rows[0].id;

    // Получаем созданную вакансию
    const job = await this.findById(id, true);
    if (!job) throw new Error('Failed to create job');
    return job;
  }

  // Поиск вакансии по ID
  static async findById(id: string, includeInactive = false): Promise<Job | null> {
    const whereClause = includeInactive ? 'WHERE j.id = $1' : 'WHERE j.id = $1 AND j.is_active = TRUE';

    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       ${whereClause}`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToJobWithUser(result.rows[0]);
  }

  // Получение списка вакансий с фильтрами и пагинацией
  static async findMany(
    filters: JobFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<{ jobs: Job[]; total: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Построение WHERE условий
    const whereConditions: string[] = [];
    const values: any[] = [];

    const addCondition = (condition: string, value: any) => {
      whereConditions.push(condition.replace(/\?/g, `$${values.length + 1}`));
      values.push(value);
    };

    // Базовое условие для активных вакансий
    if (filters.isActive !== false) {
      whereConditions.push('j.is_active = TRUE');
    }

    // Текстовый поиск через PostgreSQL FTS и триграммы
    if (filters.keyword) {
      addCondition(
        "(to_tsvector('russian', j.title || ' ' || j.company || ' ' || j.description) @@ plainto_tsquery('russian', ?) OR (j.title || ' ' || j.company) % ?)",
        filters.keyword
      );
    }

    // Точные совпадения
    const exactMatchFields = [
      'type', 'location', 'specialization', 'industry', 'region',
      'salaryFrequency', 'education', 'experience', 'employmentType',
      'schedule', 'workFormat'
    ];

    exactMatchFields.forEach(field => {
      const value = filters[field as keyof JobFilters];
      if (value) {
        addCondition(`j.${this.camelToSnake(field)} = ?`, value);
      }
    });

    // Диапазон зарплаты
    if (filters.salaryFrom) {
      addCondition('j.salary_from >= ?', filters.salaryFrom);
    }
    if (filters.salaryTo) {
      addCondition('j.salary_to <= ?', filters.salaryTo);
    }

    // Рабочие часы
    if (filters.workHours) {
      addCondition('j.work_hours = ?', filters.workHours);
    }

    // Featured
    if (filters.isFeatured !== undefined) {
      whereConditions.push(filters.isFeatured ? 'j.is_featured = TRUE' : 'j.is_featured = FALSE');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Подсчет общего количества
    const countResult = await query(
      `SELECT COUNT(*)::int as total FROM jobs j ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    // Получение данных с пагинацией
    const orderBy = 'ORDER BY j.created_at DESC';

    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       ${whereClause}
       ${orderBy}
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    const jobs = result.rows.map(row => this.mapRowToJobWithUser(row));

    return { jobs, total };
  }

  // Обновление вакансии
  static async update(id: string, jobData: UpdateJobData): Promise<Job | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const addField = (field: string, value: any) => {
      fields.push(`${field} = $${values.length + 1}`);
      values.push(value);
    };

    if (jobData.title !== undefined) addField('title', jobData.title);
    if (jobData.company !== undefined) addField('company', jobData.company);
    if (jobData.salary !== undefined) addField('salary', jobData.salary);
    if (jobData.location !== undefined) addField('location', jobData.location);
    if (jobData.type !== undefined) addField('type', jobData.type);
    if (jobData.description !== undefined) addField('description', jobData.description);
    if (jobData.tags !== undefined) addField('tags', JSON.stringify(jobData.tags));
    if (jobData.logo !== undefined) addField('logo', jobData.logo);
    if (jobData.specialization !== undefined) addField('specialization', jobData.specialization);
    if (jobData.industry !== undefined) addField('industry', jobData.industry);
    if (jobData.region !== undefined) addField('region', jobData.region);
    if (jobData.salaryFrom !== undefined) addField('salary_from', jobData.salaryFrom);
    if (jobData.salaryTo !== undefined) addField('salary_to', jobData.salaryTo);
    if (jobData.salaryFrequency !== undefined) addField('salary_frequency', jobData.salaryFrequency);
    if (jobData.education !== undefined) addField('education', jobData.education);
    if (jobData.experience !== undefined) addField('experience', jobData.experience);
    if (jobData.employmentType !== undefined) addField('employment_type', jobData.employmentType);
    if (jobData.schedule !== undefined) addField('schedule', jobData.schedule);
    if (jobData.workHours !== undefined) addField('work_hours', jobData.workHours);
    if (jobData.workFormat !== undefined) addField('work_format', jobData.workFormat);
    if (jobData.isActive !== undefined) addField('is_active', jobData.isActive);
    if (jobData.isFeatured !== undefined) addField('is_featured', jobData.isFeatured);

    if (fields.length === 0) {
      return this.findById(id, true);
    }

    values.push(id);
    await query(
      `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`,
      values
    );

    return this.findById(id, true);
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

  // Увеличение счетчика откликов
  static async incrementApplications(id: string): Promise<void> {
    await query('UPDATE jobs SET applications = applications + 1 WHERE id = $1', [id]);
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

  // Конвертация camelCase в snake_case
  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
