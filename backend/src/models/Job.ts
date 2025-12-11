import { query } from '../config/database';
import { randomBytes } from 'crypto';

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

// Генерация UUID для SQLite
const generateId = (): string => {
  return randomBytes(16).toString('hex');
};

export class JobModel {
  // Создание вакансии
  static async create(jobData: CreateJobData): Promise<Job> {
    const id = generateId();
    const tagsJson = jobData.tags ? JSON.stringify(jobData.tags) : null;

    await query(
      `INSERT INTO jobs (
        id, title, company, salary, location, type, description, tags, logo,
        specialization, industry, region, salary_from, salary_to, salary_frequency,
        education, experience, employment_type, schedule, work_hours, work_format,
        posted_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        id, jobData.title, jobData.company, jobData.salary, jobData.location, jobData.type,
        jobData.description, tagsJson, jobData.logo || null, jobData.specialization || null,
        jobData.industry || null, jobData.region || null, jobData.salaryFrom || null, jobData.salaryTo || null,
        jobData.salaryFrequency || null, jobData.education || null, jobData.experience || null,
        jobData.employmentType || null, jobData.schedule || null, jobData.workHours || null,
        jobData.workFormat || null, jobData.postedBy
      ]
    );

    // Получаем созданную вакансию
    const result = await query('SELECT * FROM jobs WHERE id = ?', [id]);
    return this.mapRowToJob(result.rows[0]);
  }

  // Поиск вакансии по ID
  static async findById(id: string, includeInactive = false): Promise<Job | null> {
    const whereClause = includeInactive ? 'WHERE j.id = ?' : 'WHERE j.id = ? AND j.is_active = 1';

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

    // Базовое условие для активных вакансий
    if (filters.isActive !== false) {
      whereConditions.push('j.is_active = ?');
      values.push(1);
    }

    // Текстовый поиск через FTS5
    if (filters.keyword) {
      whereConditions.push(`j.id IN (
        SELECT id FROM jobs_fts WHERE jobs_fts MATCH ?
      )`);
      values.push(filters.keyword);
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
        whereConditions.push(`j.${this.camelToSnake(field)} = ?`);
        values.push(value);
      }
    });

    // Диапазон зарплаты
    if (filters.salaryFrom) {
      whereConditions.push('j.salary_from >= ?');
      values.push(filters.salaryFrom);
    }
    if (filters.salaryTo) {
      whereConditions.push('j.salary_to <= ?');
      values.push(filters.salaryTo);
    }

    // Рабочие часы
    if (filters.workHours) {
      whereConditions.push('j.work_hours = ?');
      values.push(filters.workHours);
    }

    // Featured
    if (filters.isFeatured !== undefined) {
      whereConditions.push('j.is_featured = ?');
      values.push(filters.isFeatured ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Подсчет общего количества
    const countResult = await query(
      `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
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
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const jobs = result.rows.map(row => this.mapRowToJobWithUser(row));

    return { jobs, total };
  }

  // Обновление вакансии
  static async update(id: string, jobData: UpdateJobData): Promise<Job | null> {
    const fields = [];
    const values = [];

    if (jobData.title !== undefined) {
      fields.push('title = ?');
      values.push(jobData.title);
    }
    if (jobData.company !== undefined) {
      fields.push('company = ?');
      values.push(jobData.company);
    }
    if (jobData.salary !== undefined) {
      fields.push('salary = ?');
      values.push(jobData.salary);
    }
    if (jobData.location !== undefined) {
      fields.push('location = ?');
      values.push(jobData.location);
    }
    if (jobData.type !== undefined) {
      fields.push('type = ?');
      values.push(jobData.type);
    }
    if (jobData.description !== undefined) {
      fields.push('description = ?');
      values.push(jobData.description);
    }
    if (jobData.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(jobData.tags));
    }
    if (jobData.logo !== undefined) {
      fields.push('logo = ?');
      values.push(jobData.logo);
    }
    if (jobData.specialization !== undefined) {
      fields.push('specialization = ?');
      values.push(jobData.specialization);
    }
    if (jobData.industry !== undefined) {
      fields.push('industry = ?');
      values.push(jobData.industry);
    }
    if (jobData.region !== undefined) {
      fields.push('region = ?');
      values.push(jobData.region);
    }
    if (jobData.salaryFrom !== undefined) {
      fields.push('salary_from = ?');
      values.push(jobData.salaryFrom);
    }
    if (jobData.salaryTo !== undefined) {
      fields.push('salary_to = ?');
      values.push(jobData.salaryTo);
    }
    if (jobData.salaryFrequency !== undefined) {
      fields.push('salary_frequency = ?');
      values.push(jobData.salaryFrequency);
    }
    if (jobData.education !== undefined) {
      fields.push('education = ?');
      values.push(jobData.education);
    }
    if (jobData.experience !== undefined) {
      fields.push('experience = ?');
      values.push(jobData.experience);
    }
    if (jobData.employmentType !== undefined) {
      fields.push('employment_type = ?');
      values.push(jobData.employmentType);
    }
    if (jobData.schedule !== undefined) {
      fields.push('schedule = ?');
      values.push(jobData.schedule);
    }
    if (jobData.workHours !== undefined) {
      fields.push('work_hours = ?');
      values.push(jobData.workHours);
    }
    if (jobData.workFormat !== undefined) {
      fields.push('work_format = ?');
      values.push(jobData.workFormat);
    }
    if (jobData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(jobData.isActive ? 1 : 0);
    }
    if (jobData.isFeatured !== undefined) {
      fields.push('is_featured = ?');
      values.push(jobData.isFeatured ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await query(
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Удаление вакансии
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM jobs WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  // Увеличение счетчика просмотров
  static async incrementViews(id: string): Promise<void> {
    await query('UPDATE jobs SET views = views + 1 WHERE id = ?', [id]);
  }

  // Увеличение счетчика откликов
  static async incrementApplications(id: string): Promise<void> {
    await query('UPDATE jobs SET applications = applications + 1 WHERE id = ?', [id]);
  }

  // Маппинг строки БД в объект Job
  private static mapRowToJob(row: any): Job {
    const createdDate = new Date(row.created_at);
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      salary: row.salary,
      location: row.location,
      type: row.type,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags) : [],
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
  private static mapRowToJobWithUser(row: any): Job {
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