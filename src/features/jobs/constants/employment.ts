export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Полная занятость' },
  { value: 'part-time', label: 'Частичная занятость' },
  { value: 'contract', label: 'Договор' },
  { value: 'freelance', label: 'Фриланс' },
  { value: 'internship', label: 'Стажировка' }
] as const;

export const SCHEDULES = [
  { value: 'flexible', label: 'Гибкий график' },
  { value: 'fixed', label: 'Фиксированный' },
  { value: 'shift', label: 'Сменный' },
  { value: 'night', label: 'Ночные смены' },
  { value: 'weekend', label: 'Выходные дни' }
] as const;

export const WORK_FORMATS = [
  { value: 'office', label: 'Офис' },
  { value: 'remote', label: 'Удаленно' },
  { value: 'hybrid', label: 'Гибридный' }
] as const;

export const SALARY_FREQUENCIES = [
  { value: 'hourly', label: 'В час' },
  { value: 'daily', label: 'В день' },
  { value: 'weekly', label: 'В неделю' },
  { value: 'monthly', label: 'В месяц' },
  { value: 'yearly', label: 'В год' }
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number]['value'];
export type Schedule = typeof SCHEDULES[number]['value'];
export type WorkFormat = typeof WORK_FORMATS[number]['value'];
export type SalaryFrequency = typeof SALARY_FREQUENCIES[number]['value'];
