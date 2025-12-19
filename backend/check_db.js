const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
console.log('Checking database at:', dbPath);

const db = new Database(dbPath);

try {
    const users = db.prepare('SELECT id, email FROM users').all();
    console.log(`Users count: ${users.length}`);

    const resumes = db.prepare('SELECT id, user_id, title FROM resumes').all();
    console.log(`Resumes count: ${resumes.length}`);

    resumes.forEach(r => {
        const user = users.find(u => u.id === r.user_id);
        console.log(`Resume ${r.id}:`);
        console.log(`  Title: ${r.title}`);
        console.log(`  UserID: ${r.user_id}`);
        console.log(`  User Email: ${user ? user.email : 'NOT FOUND IN USERS TABLE!'} (${user ? user.id : '?'})`);
    });

    // Also check if any user does NOT have a resume
    users.forEach(u => {
        const resume = resumes.find(r => r.user_id === u.id);
        if (!resume) {
            console.log(`User ${u.email} (${u.id}) has NO resume.`);
        }
    });

} catch (err) {
    console.error('Error:', err);
}

db.close();
