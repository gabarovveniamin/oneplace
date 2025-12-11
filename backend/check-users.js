const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath, { readonly: true });

console.log('📊 Проверка пользователей в базе данных:\n');

try {
    const users = db.prepare('SELECT id, email, first_name, last_name, role, created_at FROM users').all();

    if (users.length === 0) {
        console.log('❌ В базе данных нет пользователей');
    } else {
        console.log(`✅ Найдено пользователей: ${users.length}\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Роль: ${user.role}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Создан: ${user.created_at}`);
            console.log('');
        });
    }
} catch (error) {
    console.error('❌ Ошибка при чтении базы данных:', error.message);
}

db.close();
