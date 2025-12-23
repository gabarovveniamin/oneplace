# План перехода на PostgreSQL для командной разработки

Переход на PostgreSQL — это отличный шаг для работы в команде. SQLite хорош для одного человека, но PostgreSQL — это стандарт индустрии, который позволяет работать многим пользователям одновременно и легко разворачивается на серверах.

## 1. Инфраструктура (Docker) — Самое важное
Чтобы у всех одногруппников база данных была одинаковой, лучше всего использовать **Docker**.

Создайте файл `docker-compose.yml` в корне проекта:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: oneplace_db
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: oneplace
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Инструкция для друзей:**
1. Установите Docker Desktop.
2. Запустите консоль и напишите `docker-compose up -d`. Всё, база данных готова у всех!

---

## 2. Обновление серверной части

### Установка зависимостей
В папке `backend` нужно будет выполнить:
```bash
npm install pg
npm install -D @types/pg
```

### Обновление .env
Добавьте параметры подключения:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=oneplace
```

---

## 3. Изменение `backend/src/config/database.ts`
Поскольку я ранее написал `database.ts` с закосом под PostgreSQL, замена будет безболезненной.

```typescript
import { Pool } from 'pg';
import { config } from './config';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export default pool;
```

---

## 4. Почему это круто для проекта с однокурсниками?

1.  **Одновременная работа**: PostgreSQL умеет работать с сотнями запросов сразу. SQLite блокируется, если кто-то один пишет в базу.
2.  **Типы данных**: PostgreSQL поддерживает JSONB, массивы и ГИС-данные.
3.  **Безопасность**: Можно настраивать права доступа для разных пользователей.
4.  **Готовность к Deploy**: Любой хостинг (Render, Railway, AWS) предложит вам именно PostgreSQL для живого сайта.

---

## Что нужно сделать сейчас?
Если ты готов, я могу:
1. Создать файл `docker-compose.yml`.
2. Переписать `database.ts` и `initDatabase.ts` под PostgreSQL (есть небольшие отличия в синтаксисе создания таблиц, например, генерация ID).
3. Помочь настроить `.env`.

**Делаем?**
