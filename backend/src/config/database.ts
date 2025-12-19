import path from 'path';
import { config } from './config';

// better-sqlite3 требует CommonJS импорт
const BetterSqlite3 = require('better-sqlite3');

// Путь к файлу базы данных
// Путь к файлу базы данных
// Using absolute path from process.cwd() (project root) to avoid relative path issues between src/ and dist/
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
console.log('🔌 Database path resolved to:', dbPath);

// Создаем подключение к SQLite
const db = new BetterSqlite3(dbPath, {
  verbose: config.nodeEnv === 'development' ? console.log : undefined,
});

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// Оптимизация производительности
db.pragma('journal_mode = WAL'); // Write-Ahead Logging для лучшей производительности
db.pragma('synchronous = NORMAL'); // Баланс между скоростью и безопасностью
db.pragma('cache_size = -64000'); // 64MB кэша
db.pragma('temp_store = MEMORY'); // Временные таблицы в памяти

// Функция для выполнения запросов (совместимость с PostgreSQL API)
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    // Преобразуем PostgreSQL параметры ($1, $2) в SQLite (?, ?)
    const sqliteQuery = text.replace(/\$\d+/g, '?');

    // Определяем тип запроса
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
    const isReturning = sqliteQuery.toUpperCase().includes('RETURNING');

    let result;

    if (isSelect || isReturning) {
      // Для SELECT и INSERT...RETURNING используем all()
      const stmt = db.prepare(sqliteQuery);
      const rows = params && params.length > 0 ? stmt.all(...params) : stmt.all();
      result = { rows, rowCount: rows.length };
    } else {
      // Для INSERT, UPDATE, DELETE используем run()
      const stmt = db.prepare(sqliteQuery);
      const info = params && params.length > 0 ? stmt.run(...params) : stmt.run();
      result = { rows: [], rowCount: info.changes };
    }

    const duration = Date.now() - start;
    if (config.nodeEnv === 'development') {
      console.log('Executed query', { text: sqliteQuery.substring(0, 100), duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// Функция для получения клиента (для совместимости с PostgreSQL API)
export const getClient = async () => {
  return {
    query,
    release: () => { }, // SQLite не требует освобождения соединений
  };
};

// Функция для тестирования подключения
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT datetime('now') as now");
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Функция для закрытия базы данных
export const closePool = async (): Promise<void> => {
  db.close();
};

// Обработка закрытия приложения
process.on('exit', () => {
  db.close();
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;