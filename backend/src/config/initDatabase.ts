import { query } from './database';

export const initializeDatabase = async () => {
  console.log('🔧 Initializing PostgreSQL database...');

  try {
    // Включаем расширение для UUID если его нет (для старых версий Postgres)
    await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Включаем расширение для триграмм (для нечеткого поиска)
    await query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

    // 1. Таблица пользователей
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        avatar TEXT,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'employer', 'admin')),
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        org_name VARCHAR(255),
        org_industry VARCHAR(255),
        org_location VARCHAR(255),
        org_description TEXT,
        org_website VARCHAR(255),
        org_email VARCHAR(255),
        org_phone VARCHAR(20),
        org_logo TEXT
      )
    `);

    // Проверка и добавление отсутствующих колонок (миграция)
    const columnsToCheck = [
      { name: 'org_name', type: 'VARCHAR(255)' },
      { name: 'org_industry', type: 'VARCHAR(255)' },
      { name: 'org_location', type: 'VARCHAR(255)' },
      { name: 'org_description', type: 'TEXT' },
      { name: 'org_website', type: 'VARCHAR(255)' },
      { name: 'org_email', type: 'VARCHAR(255)' },
      { name: 'org_phone', type: 'VARCHAR(20)' },
      { name: 'org_logo', type: 'TEXT' }
    ];

    for (const col of columnsToCheck) {
      const colCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name=$1
      `, [col.name]);

      if (colCheck.rowCount === 0) {
        console.log(`🚀 Adding column ${col.name} to users table...`);
        await query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // 2. Таблица вакансий
    await query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        salary VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'daily', 'projects', 'travel')),
        description TEXT NOT NULL,
        tags JSONB DEFAULT '[]',
        logo TEXT,
        
        specialization VARCHAR(255),
        industry VARCHAR(255),
        region VARCHAR(255),
        salary_from INTEGER,
        salary_to INTEGER,
        salary_frequency VARCHAR(20) CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
        education VARCHAR(30) CHECK (education IN ('no-education', 'secondary', 'vocational', 'bachelor', 'master', 'phd')),
        experience VARCHAR(30) CHECK (experience IN ('no-experience', '1-year', '1-3-years', '3-5-years', '5-10-years', '10-plus-years')),
        employment_type VARCHAR(20) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
        schedule VARCHAR(20) CHECK (schedule IN ('flexible', 'fixed', 'shift', 'night', 'weekend')),
        work_hours INTEGER CHECK (work_hours >= 1 AND work_hours <= 24),
        work_format VARCHAR(20) CHECK (work_format IN ('office', 'remote', 'hybrid')),
        
        posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        views INTEGER DEFAULT 0,
        applications INTEGER DEFAULT 0,
        expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Таблица избранного
    await query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, job_id)
      )
    `);

    // 4. Таблица заявок
    await query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'accepted')),
        cover_letter TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Таблица уведомлений
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id UUID,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Таблица сообщений
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Таблица резюме
    await query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        city VARCHAR(100),
        phone VARCHAR(20),
        salary VARCHAR(100),
        summary TEXT,
        skills JSONB DEFAULT '[]',
        experience JSONB DEFAULT '[]',
        education JSONB DEFAULT '[]',
        projects JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // 8. Таблица друзей
    await query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id),
        CHECK (user_id != friend_id)
      )
    `);

    // 9. Таблица товаров в маркете (объявления)
    await query(`
      CREATE TABLE IF NOT EXISTS market_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        images JSONB DEFAULT '[]',
        location VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden')),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Таблица услуг (фриланс-профили исполнителей)
    await query(`
      CREATE TABLE IF NOT EXISTS service_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(15, 2) NOT NULL,
        pricing_type VARCHAR(20) DEFAULT 'hourly' CHECK (pricing_type IN ('hourly', 'fixed', 'monthly')),
        experience_level VARCHAR(20) DEFAULT 'middle' CHECK (experience_level IN ('junior', 'middle', 'senior')),
        tags JSONB DEFAULT '[]',
        location VARCHAR(255),
        portfolio_url TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused')),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание индексов
    await query('CREATE INDEX IF NOT EXISTS idx_friendships_user_ids ON friendships(user_id, friend_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING GIN (to_tsvector(\'russian\', title || \' \' || company || \' \' || description))');
    await query('CREATE INDEX IF NOT EXISTS idx_market_listings_user_id ON market_listings(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_market_listings_category ON market_listings(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_market_listings_trgm ON market_listings USING GIN ((title || \' \' || description) gin_trgm_ops)');
    await query('CREATE INDEX IF NOT EXISTS idx_service_listings_user_id ON service_listings(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_service_listings_category ON service_listings(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_service_listings_trgm ON service_listings USING GIN ((title || \' \' || description) gin_trgm_ops)');

    // Триграммные индексы для нечеткого поиска
    await query('CREATE INDEX IF NOT EXISTS idx_jobs_trgm ON jobs USING GIN ((title || \' \' || company) gin_trgm_ops)');
    await query('CREATE INDEX IF NOT EXISTS idx_resumes_trgm ON resumes USING GIN ((title || \' \' || skills::text || \' \' || summary) gin_trgm_ops)');

    await query('CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active)');
    await query('CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id)');

    // Migration: Add image_url to community_posts if not exists
    const imageUrlCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='community_posts' AND column_name='image_url'
    `);
    if (imageUrlCheck.rowCount === 0) {
      console.log('🚀 Adding image_url column to community_posts table...');
      await query('ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url TEXT');
    }

    // Migration: Add views_count to community_posts if not exists
    const viewsCountCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='community_posts' AND column_name='views_count'
    `);
    if (viewsCountCheck.rowCount === 0) {
      console.log('🚀 Adding views_count column to community_posts table...');
      await query('ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0');
    }

    // Create community_reposts table for retweet functionality
    await query(`
      CREATE TABLE IF NOT EXISTS community_reposts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_community_reposts_user ON community_reposts(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_community_reposts_post ON community_reposts(post_id)');

    // Create community_post_views table for unique view tracking
    await query(`
      CREATE TABLE IF NOT EXISTS community_post_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_community_post_views_post ON community_post_views(post_id)');

    console.log('✅ PostgreSQL database initialized successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};