// Базовые типы для API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Типы для вакансий
export interface CreateJobRequest {
  title: string;
  company: string;
  salary: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'daily' | 'projects' | 'travel';
  description: string;
  tags?: string[];
  logo?: string;
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
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
}

export interface JobResponse {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'daily' | 'projects' | 'travel';
  description: string;
  tags: string[];
  logo?: string;
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
  postedBy: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  applications: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  postedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SearchJobsRequest {
  keyword?: string;
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
  type?: string;
  page?: number;
  limit?: number;
}
