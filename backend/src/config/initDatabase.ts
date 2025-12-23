import database from './database';

const db = database;

export const initializeDatabase = () => {
  console.log('🔧 Initializing SQLite database...');

  try {
    // Создание таблицы пользователей
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'employer', 'admin')),
        is_email_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        last_login TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        org_name TEXT,
        org_industry TEXT,
        org_location TEXT,
        org_description TEXT,
        org_website TEXT,
        org_email TEXT,
        org_phone TEXT,
        org_logo TEXT
      )
    `);

    // Миграция: добавление колонок организации, если их нет
    const columns = [
      'org_name', 'org_industry', 'org_location', 'org_description',
      'org_website', 'org_email', 'org_phone', 'org_logo'
    ];

    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const existingColumns = tableInfo.map((col: any) => col.name);

    columns.forEach(col => {
      if (!existingColumns.includes(col)) {
        console.log(`🚀 Adding column ${col} to users table...`);
        db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
      }
    });

    // Создание таблицы вакансий
    db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        salary TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'daily', 'projects', 'travel')),
        description TEXT NOT NULL,
        tags TEXT, -- JSON массив строк
        logo TEXT,
        
        -- Расширенные поля для поиска
        specialization TEXT,
        industry TEXT,
        region TEXT,
        salary_from INTEGER,
        salary_to INTEGER,
        salary_frequency TEXT CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
        education TEXT CHECK (education IN ('no-education', 'secondary', 'vocational', 'bachelor', 'master', 'phd')),
        experience TEXT CHECK (experience IN ('no-experience', '1-year', '1-3-years', '3-5-years', '5-10-years', '10-plus-years')),
        employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
        schedule TEXT CHECK (schedule IN ('flexible', 'fixed', 'shift', 'night', 'weekend')),
        work_hours INTEGER CHECK (work_hours >= 1 AND work_hours <= 24),
        work_format TEXT CHECK (work_format IN ('office', 'remote', 'hybrid')),
        
        -- Метаданные
        posted_by TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        applications INTEGER DEFAULT 0,
        expires_at TEXT DEFAULT (datetime('now', '+30 days')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Создание таблицы избранного
    db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, job_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // Создание таблицы заявок (откликов)
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        job_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'accepted')),
        cover_letter TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Создание таблицы уведомлений
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Создание индексов для пользователей
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `);

    // Создание индексов для вакансий
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
      CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
      CREATE INDEX IF NOT EXISTS idx_jobs_specialization ON jobs(specialization);
      CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
      CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region);
      CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_from, salary_to);
      CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience);
      CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
      CREATE INDEX IF NOT EXISTS idx_jobs_work_format ON jobs(work_format);
      CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
      CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
      CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
    `);

    // Создание виртуальной таблицы для полнотекстового поиска (FTS5)
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
        id UNINDEXED,
        title,
        description,
        company,
        content=jobs,
        content_rowid=rowid
      );
    `);

    // Триггеры для синхронизации FTS таблицы
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS jobs_fts_insert AFTER INSERT ON jobs BEGIN
        INSERT INTO jobs_fts(rowid, id, title, description, company)
        VALUES (new.rowid, new.id, new.title, new.description, new.company);
      END;

      CREATE TRIGGER IF NOT EXISTS jobs_fts_delete AFTER DELETE ON jobs BEGIN
        DELETE FROM jobs_fts WHERE rowid = old.rowid;
      END;

      CREATE TRIGGER IF NOT EXISTS jobs_fts_update AFTER UPDATE ON jobs BEGIN
        UPDATE jobs_fts SET title = new.title, description = new.description, company = new.company
        WHERE rowid = new.rowid;
      END;
    `);

    // Удаляем старый триггер, если он был (чтобы избежать рекурсии, так как теперь обновляем вручную)
    db.exec(`DROP TRIGGER IF EXISTS update_users_updated_at`);

    // Триггеры для автоматического обновления updated_at (только для jobs, users обновляем вручную)
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_jobs_updated_at 
      AFTER UPDATE ON jobs
      BEGIN
        UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
    `);

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables: users, jobs');
    console.log('🔍 Full-text search: enabled (FTS5)');
    console.log('📈 Indexes: created for optimal performance');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};
