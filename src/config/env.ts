// Конфигурация приложения
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
    timeout: 10000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'OnePlace',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    devMode: import.meta.env.VITE_DEV_MODE === 'true',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;
