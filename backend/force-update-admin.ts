import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔄 Updating admin role...');

try {
    const email = 'admin@oneplace.com';
    const stmt = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?");
    const result = stmt.run(email);

    if (result.changes > 0) {
        console.log('✅ Successfully updated role to admin!');
    } else {
        console.log('❌ User not found via raw SQL update.');
    }
} catch (error: any) {
    console.error('❌ Error updating admin:', error.message);
}

db.close();
