export interface Job {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  type: string;
  description: string;
  tags: string[];
  logo?: string;
  postedAt: string;
  // Новые поля для расширенного поиска
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

export interface SearchFilters {
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
}
