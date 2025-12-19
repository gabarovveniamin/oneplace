const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

const email = 'venagabarov@gmail.com';
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!user) {
    console.log(`User ${email} not found.`);
} else {
    console.log(`User ${email} found with ID: ${user.id}`);
    const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ?').get(user.id);
    if (resume) {
        console.log('Resume FOUND!');
        console.log('Resume ID:', resume.id);
        console.log('Resume Title:', resume.title);
    } else {
        console.log('Resume NOT found for this user.');
    }
}

db.close();
