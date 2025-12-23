const BetterSqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend', 'database.sqlite');
const db = new BetterSqlite3(dbPath);

try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    console.log('Columns in users table:');
    tableInfo.forEach(col => console.log(`- ${col.name} (${col.type})`));
} catch (err) {
    console.log('Error reading database:', err.message);
} finally {
    db.close();
}
