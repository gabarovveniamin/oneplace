const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

const targetId = '483db70da1836fd5c0acdc3f8df20252';

const user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
console.log('User check for ID:', targetId);
if (user) {
    console.log('User FOUND:', user.email);
} else {
    console.log('User NOT FOUND with this ID');
}

const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ?').get(targetId);
if (resume) {
    console.log('Resume FOUND for this ID');
    console.log('Resume ID:', resume.id);
    console.log('Status:', resume.status);
    console.log('Created At:', resume.created_at);
    console.log('Updated At:', resume.updated_at);

    try {
        const d1 = new Date(resume.created_at);
        console.log('Created Date Obj:', d1.toISOString());
    } catch (e) { console.log('Date parse error:', e.message); }

    console.log('Skills (raw):', resume.skills, 'Type:', typeof resume.skills);
    console.log('Experience (raw):', resume.experience, 'Type:', typeof resume.experience);
    console.log('Education (raw):', resume.education, 'Type:', typeof resume.education);
    console.log('Projects (raw):', resume.projects, 'Type:', typeof resume.projects);

    try {
        if (resume.skills) JSON.parse(resume.skills);
        console.log('Skills JSON: Valid');
    } catch (e) {
        console.log('Skills JSON: INVALID', e.message);
    }

    try {
        if (resume.experience) JSON.parse(resume.experience);
        console.log('Experience JSON: Valid');
    } catch (e) {
        console.log('Experience JSON: INVALID', e.message);
    }
} else {
    console.log('Resume NOT FOUND for this ID');
}

db.close();
