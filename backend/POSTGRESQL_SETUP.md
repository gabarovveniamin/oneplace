# Настройка PostgreSQL для OnePlace Backend

## 🐘 PostgreSQL с Docker

### 🚀 Быстрый старт

1. **Запустите PostgreSQL через Docker:**
```bash
docker-compose up -d postgres
```

2. **Проверьте статус контейнера:**
```bash
docker ps
```

3. **Подключитесь к базе данных:**
```bash
docker exec -it onepace-postgres psql -U onepace_user -d onepace
```

### 📊 Структура базы данных

#### Таблица `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица `jobs`
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[],
    logo VARCHAR(500),
    
    -- Расширенные поля
    specialization VARCHAR(100),
    industry VARCHAR(100),
    region VARCHAR(100),
    salary_from INTEGER,
    salary_to INTEGER,
    salary_frequency VARCHAR(20),
    education VARCHAR(20),
    experience VARCHAR(20),
    employment_type VARCHAR(20),
    schedule VARCHAR(20),
    work_hours INTEGER,
    work_format VARCHAR(20),
    
    -- Метаданные
    posted_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔧 Конфигурация

#### Переменные окружения (.env)
```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=onepace
POSTGRES_USER=onepace_user
POSTGRES_PASSWORD=onepace_password

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 🚀 Запуск приложения

1. **Установите зависимости:**
```bash
npm install
```

2. **Запустите сервер:**
```bash
npm run dev
```

3. **Проверьте подключение:**
```bash
curl http://localhost:3000/health
```

### 📝 Полезные команды

#### Подключение к базе данных
```bash
# Через Docker
docker exec -it onepace-postgres psql -U onepace_user -d onepace

# Через psql (если установлен локально)
psql -h localhost -p 5433 -U onepace_user -d onepace
```

#### Просмотр таблиц
```sql
\dt
```

#### Просмотр структуры таблицы
```sql
\d users
\d jobs
```

#### Очистка базы данных
```bash
docker-compose down -v
docker-compose up -d postgres
```

### 🔍 Индексы и оптимизация

#### Созданные индексы:
- `idx_users_email` - для быстрого поиска по email
- `idx_users_role` - для фильтрации по ролям
- `idx_jobs_type` - для фильтрации по типу работы
- `idx_jobs_location` - для поиска по локации
- `idx_jobs_specialization` - для фильтрации по специализации
- `idx_jobs_search` - полнотекстовый поиск (GIN индекс)

#### Полнотекстовый поиск
```sql
-- Поиск по названию, описанию и компании
SELECT * FROM jobs 
WHERE to_tsvector('russian', title || ' ' || description || ' ' || company) 
@@ plainto_tsquery('russian', 'разработчик');
```

### 🛠️ Разработка

#### Добавление новых полей
1. Обновите SQL схему в `init-scripts/02-create-tables.sql`
2. Обновите интерфейсы в `src/models/`
3. Обновите контроллеры
4. Пересоздайте контейнер: `docker-compose down -v && docker-compose up -d postgres`

#### Миграции
Для изменений схемы используйте SQL миграции в папке `init-scripts/`.

### 🐛 Отладка

#### Проверка подключения
```bash
# Проверка статуса контейнера
docker ps | grep postgres

# Проверка логов
docker logs onepace-postgres

# Проверка подключения из приложения
curl http://localhost:3000/health
```

#### Частые проблемы
1. **Порт занят** - измените порт в `docker-compose.yml`
2. **Пароль не подходит** - проверьте переменные окружения
3. **Таблицы не созданы** - пересоздайте контейнер с `-v` флагом

### 📊 Мониторинг

#### Статистика базы данных
```sql
-- Размер базы данных
SELECT pg_size_pretty(pg_database_size('onepace'));

-- Количество записей
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM jobs) as jobs_count;

-- Активные вакансии
SELECT COUNT(*) FROM jobs WHERE is_active = true;
```

### 🔒 Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Валидация всех входных данных
- SQL injection защита через параметризованные запросы
- CORS настройки
- Rate limiting

### 🚀 Продакшн

Для продакшна:
1. Измените пароли в переменных окружения
2. Настройте SSL для PostgreSQL
3. Используйте connection pooling
4. Настройте бэкапы
5. Мониторинг производительности
