import { query } from '../config/database';
import { randomBytes } from 'crypto';

export interface Experience {
    id: string;
    company: string;
    position: string;
    period: string;
    description: string;
}

export interface Education {
    id: string;
    university: string;
    degree: string;
    year: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
}

export interface Resume {
    id: string;
    userId: string;
    title: string; // Desired position
    city: string;
    phone: string;
    salary: string;
    summary: string;
    skills: string[]; // Stored as JSON
    experience: Experience[]; // Stored as JSON
    education: Education[]; // Stored as JSON
    projects: Project[]; // Stored as JSON
    status: 'active' | 'hidden';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateResumeData {
    userId: string;
    title: string;
    city: string;
    phone: string;
    salary: string;
    summary: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    projects: Project[];
}

const generateId = (): string => {
    return randomBytes(16).toString('hex');
};

export class ResumeModel {
    static async initTable() {
        await query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        title TEXT,
        city TEXT,
        phone TEXT,
        salary TEXT,
        summary TEXT,
        skills TEXT,
        experience TEXT,
        education TEXT,
        projects TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    }

    static async createOrUpdate(data: CreateResumeData): Promise<Resume> {
        console.log('ResumeModel.createOrUpdate called for userId:', data.userId);
        // Check if resume exists
        const existing = await this.findByUserId(data.userId);
        console.log('Existing resume found:', existing ? 'YES' : 'NO');

        const skillsJson = JSON.stringify(data.skills);
        const expJson = JSON.stringify(data.experience);
        const eduJson = JSON.stringify(data.education);
        const projJson = JSON.stringify(data.projects);

        if (existing) {
            await query(`
        UPDATE resumes SET 
          title = ?, city = ?, phone = ?, salary = ?, summary = ?,
          skills = ?, experience = ?, education = ?, projects = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
                data.title, data.city, data.phone, data.salary, data.summary,
                skillsJson, expJson, eduJson, projJson,
                data.userId
            ]);
            return (await this.findByUserId(data.userId))!;
        } else {
            const id = generateId();
            await query(`
        INSERT INTO resumes (
          id, user_id, title, city, phone, salary, summary,
          skills, experience, education, projects
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                id, data.userId, data.title, data.city, data.phone, data.salary, data.summary,
                skillsJson, expJson, eduJson, projJson
            ]);
            return (await this.findByUserId(data.userId))!;
        }
    }

    static async findByUserId(userId: string): Promise<Resume | null> {
        const result = await query('SELECT * FROM resumes WHERE user_id = ?', [userId]);
        if (result.rows.length === 0) return null;
        return this.mapRowToResume(result.rows[0]);
    }

    private static mapRowToResume(row: any): Resume {
        try {
            console.log('Mapping row to resume:', row.id);
            return {
                id: row.id,
                userId: row.user_id,
                title: row.title,
                city: row.city,
                phone: row.phone,
                salary: row.salary,
                summary: row.summary,
                skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : (row.skills || []),
                experience: typeof row.experience === 'string' ? JSON.parse(row.experience) : (row.experience || []),
                education: typeof row.education === 'string' ? JSON.parse(row.education) : (row.education || []),
                projects: typeof row.projects === 'string' ? JSON.parse(row.projects) : (row.projects || []),
                status: row.status,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            };
        } catch (error) {
            console.error('Error mapping resume row:', error);
            console.error('Row data:', row);
            throw error;
        }
    }
}
