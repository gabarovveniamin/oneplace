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
      ) RETURNING *`,
      [
        jobData.title, jobData.company, jobData.salary, jobData.location, jobData.type,
        jobData.description, jobData.tags || [], jobData.logo, jobData.specialization,
        jobData.industry, jobData.region, jobData.salaryFrom, jobData.salaryTo,
        jobData.salaryFrequency, jobData.education, jobData.experience, jobData.employmentType,
        jobData.schedule, jobData.workHours, jobData.workFormat, jobData.postedBy
      ]
    );

    return this.mapRowToJob(result.rows[0]);
  }

  // Поиск вакансии по ID
  static async findById(id: string, includeInactive = false): Promise<Job | null> {
    const whereClause = includeInactive ? 'WHERE j.id = $1' : 'WHERE j.id = $1 AND j.is_active = true';
    
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
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    // Базовое условие для активных вакансий
    if (filters.isActive !== false) {
      whereConditions.push(`j.is_active = $${paramCount++}`);
      values.push(true);
    }

    // Текстовый поиск
    if (filters.keyword) {
      whereConditions.push(`to_tsvector('russian', j.title || ' ' || j.description || ' ' || j.company) @@ plainto_tsquery('russian', $${paramCount++})`);
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
        whereConditions.push(`j.${this.camelToSnake(field)} = $${paramCount++}`);
        values.push(value);
      }
    });

    // Диапазон зарплаты
    if (filters.salaryFrom) {
      whereConditions.push(`j.salary_from >= $${paramCount++}`);
      values.push(filters.salaryFrom);
    }
    if (filters.salaryTo) {
      whereConditions.push(`j.salary_to <= $${paramCount++}`);
      values.push(filters.salaryTo);
    }

    // Рабочие часы
    if (filters.workHours) {
      whereConditions.push(`j.work_hours = $${paramCount++}`);
      values.push(filters.workHours);
    }

    // Featured
    if (filters.isFeatured !== undefined) {
      whereConditions.push(`j.is_featured = $${paramCount++}`);
      values.push(filters.isFeatured);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Подсчет общего количества
    const countResult = await query(
      `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total);

    // Получение данных с пагинацией
    const orderBy = filters.keyword 
      ? `ORDER BY ts_rank(to_tsvector('russian', j.title || ' ' || j.description || ' ' || j.company), plainto_tsquery('russian', $${paramCount++})) DESC, j.created_at DESC`
      : 'ORDER BY j.created_at DESC';

    if (filters.keyword) {
      values.push(filters.keyword);
    }

    const result = await query(
      `SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       ${whereClause}
       ${orderBy}
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      [...values, limit, offset]
    );

    const jobs = result.rows.map(row => this.mapRowToJobWithUser(row));

    return { jobs, total };
  }

  // Маппинг строки БД в объект Job
  private static mapRowToJob(row: any): Job {
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      salary: row.salary,
      location: row.location,
      type: row.type,
      description: row.description,
      tags: row.tags || [],
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
      isActive: row.is_active,
      isFeatured: row.is_featured,
      views: row.views,
      applications: row.applications,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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