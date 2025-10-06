-- Создание расширений для PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создание индексов для полнотекстового поиска
-- (Будет создано после создания таблиц через Prisma)

-- Настройка для лучшей производительности
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET track_activity_query_size = 2048;
-- ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Создание пользователя для приложения (если нужно)
-- CREATE USER onepace_app WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE onepace TO onepace_app;
