const BetterSqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend/database.sqlite');
const db = new BetterSqlite3(dbPath);

try {
    db.exec(`
        ALTER TABLE users ADD COLUMN org_name VARCHAR(255);
        ALTER TABLE users ADD COLUMN org_industry VARCHAR(255);
        ALTER TABLE users ADD COLUMN org_location VARCHAR(255);
        ALTER TABLE users ADD COLUMN org_description TEXT;
        ALTER TABLE users ADD COLUMN org_website VARCHAR(255);
        ALTER TABLE users ADD COLUMN org_email VARCHAR(255);
        ALTER TABLE users ADD COLUMN org_phone VARCHAR(20);
        ALTER TABLE users ADD COLUMN org_logo TEXT;
    `);
    console.log('✅ Organization columns added successfully');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('ℹ️ Columns already exist');
    } else {
        console.error('❌ Error updating database:', err.message);
    }
} finally {
    db.close();
}
