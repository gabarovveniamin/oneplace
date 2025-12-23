
const BetterSqlite3 = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new BetterSqlite3(dbPath);

async function createAdmin() {
    try {
        const adminEmail = 'admin@oneplace.com';
        const adminPass = 'adminpassword123';

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

        if (existing) {
            console.log('User exists, promoting to admin...');
            db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', adminEmail);
            console.log('✅ Success: User is now admin');
        } else {
            console.log('Creating new admin user...');
            const id = randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(adminPass, 12);

            db.prepare(`
                INSERT INTO users (id, email, password, first_name, last_name, role, is_active, is_email_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, adminEmail, hashedPassword, 'Главный', 'Администратор', 'admin', 1, 1);

            console.log('✅ Success: Admin account created.');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPass);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

createAdmin();
