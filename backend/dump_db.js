const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

const users = db.prepare('SELECT id, email FROM users').all();
console.log('--- USERS ---');
users.forEach(u => console.log(`User: ${u.email} | ID: ${u.id}`));

console.log('--- RESUMES ---');
const resumes = db.prepare('SELECT id, user_id FROM resumes').all();
resumes.forEach(r => console.log(`ResumeID: ${r.id} | UserID: ${r.user_id}`));

// Check match
console.log('--- ANALYSIS ---');
users.forEach(u => {
    const r = resumes.find(res => res.user_id === u.id);
    console.log(`User ${u.email}: ${r ? 'HAS RESUME' : 'NO RESUME'}`);
});

db.close();
