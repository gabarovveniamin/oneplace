export const SPECIALIZATIONS = [
  'Frontend разработка',
  'Backend разработка',
  'Fullstack разработка',
  'Mobile разработка',
  'DevOps',
  'Data Science',
  'Machine Learning',
  'UI/UX дизайн',
  'QA/Тестирование',
  'Системное администрирование',
  'Маркетинг',
  'Продажи',
  'Менеджмент',
  'Финансы',
  'HR',
  'Другое'
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];
