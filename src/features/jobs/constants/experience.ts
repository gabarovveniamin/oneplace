export const EXPERIENCE_LEVELS = [
  { value: 'no-experience', label: 'Без опыта' },
  { value: '1-year', label: 'До 1 года' },
  { value: '1-3-years', label: '1-3 года' },
  { value: '3-5-years', label: '3-5 лет' },
  { value: '5-10-years', label: '5-10 лет' },
  { value: '10-plus-years', label: 'Более 10 лет' }
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]['value'];
