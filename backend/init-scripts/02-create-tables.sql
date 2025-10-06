-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'employer', 'admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы вакансий
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'daily', 'projects', 'travel')),
    description TEXT NOT NULL,
    tags TEXT[], -- массив строк
    logo VARCHAR(500),
    
    -- Расширенные поля для поиска
    specialization VARCHAR(100),
    industry VARCHAR(100),
    region VARCHAR(100),
    salary_from INTEGER,
    salary_to INTEGER,
    salary_frequency VARCHAR(20) CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
    education VARCHAR(20) CHECK (education IN ('no-education', 'secondary', 'vocational', 'bachelor', 'master', 'phd')),
    experience VARCHAR(20) CHECK (experience IN ('no-experience', '1-year', '1-3-years', '3-5-years', '5-10-years', '10-plus-years')),
    employment_type VARCHAR(20) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    schedule VARCHAR(20) CHECK (schedule IN ('flexible', 'fixed', 'shift', 'night', 'weekend')),
    work_hours INTEGER CHECK (work_hours >= 1 AND work_hours <= 24),
    work_format VARCHAR(20) CHECK (work_format IN ('office', 'remote', 'hybrid')),
    
    -- Метаданные
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

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

-- Создание полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('russian', title || ' ' || description || ' ' || company));

-- Создание триггера для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
