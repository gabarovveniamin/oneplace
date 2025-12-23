
const BetterSqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend', 'database.sqlite');
const db = new BetterSqlite3(dbPath);

try {
    const users = db.prepare('SELECT email, role FROM users').all();
    console.log('Users in database:', users);
} catch (err) {
    console.log('Error reading database:', err.message);
}
