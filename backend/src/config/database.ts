import { Pool } from 'pg';
import { config } from './config';

// Создаем пул соединений к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

// Логирование ошибок пула
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Функция для выполнения запросов (совместимость с PostgreSQL API)
export const query = async <T = any>(text: string, params?: any[]): Promise<{ rows: T[], rowCount: number }> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (config.nodeEnv === 'development') {
      console.log('Executed query', {
        text: text.substring(0, 100).replace(/\n/g, ' '),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }

    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (err) {
    const error = err as Error;
    console.error('Database query error:', error.message);
    console.error('Query:', text);
    if (params) console.error('Params:', params);
    throw error;
  }
};

// Функция для получения клиента (для транзакций)
export const getClient = async () => {
  const client = await pool.connect();
  return {
    query: client.query.bind(client),
    release: client.release.bind(client),
  };
};

// Функция для тестирования подключения
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT NOW() as now");
    console.log('✅ PostgreSQL connected successfully:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    return false;
  }
};

// Функция для закрытия пула
export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
