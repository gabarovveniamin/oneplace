export const EDUCATION_LEVELS = [
  { value: 'no-education', label: 'Без образования' },
  { value: 'secondary', label: 'Среднее образование' },
  { value: 'vocational', label: 'Среднее специальное' },
  { value: 'bachelor', label: 'Высшее (бакалавриат)' },
  { value: 'master', label: 'Высшее (магистратура)' },
  { value: 'phd', label: 'Ученая степень' }
] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number]['value'];
