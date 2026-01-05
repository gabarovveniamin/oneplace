import { query } from '../config/database';
import { randomUUID } from 'crypto';

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
    title: string;
    city: string;
    phone: string;
    salary: string;
    summary: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    projects: Project[];
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

export class ResumeModel {
    static async createOrUpdate(data: CreateResumeData): Promise<Resume> {
        // Check if resume exists
        const existing = await this.findByUserId(data.userId);

        const skillsJson = JSON.stringify(data.skills);
        const expJson = JSON.stringify(data.experience);
        const eduJson = JSON.stringify(data.education);
        const projJson = JSON.stringify(data.projects);

        if (existing) {
            await query(`
                UPDATE resumes SET 
                  title = $1, city = $2, phone = $3, salary = $4, summary = $5,
                  skills = $6, experience = $7, education = $8, projects = $9,
                  updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $10
            `, [
                data.title, data.city, data.phone, data.salary, data.summary,
                skillsJson, expJson, eduJson, projJson,
                data.userId
            ]);
            return (await this.findByUserId(data.userId))!;
        } else {
            const id = randomUUID();
            await query(`
                INSERT INTO resumes (
                  id, user_id, title, city, phone, salary, summary,
                  skills, experience, education, projects
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                id, data.userId, data.title, data.city, data.phone, data.salary, data.summary,
                skillsJson, expJson, eduJson, projJson
            ]);
            return (await this.findByUserId(data.userId))!;
        }
    }

    static async findByUserId(userId: string): Promise<Resume | null> {
        const result = await query('SELECT * FROM resumes WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) return null;
        return this.mapRowToResume(result.rows[0]);
    }

    private static mapRowToResume(row: Record<string, any>): Resume {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title || '',
            city: row.city || '',
            phone: row.phone || '',
            salary: row.salary || '',
            summary: row.summary || '',
            skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : (row.skills || []),
            experience: typeof row.experience === 'string' ? JSON.parse(row.experience) : (row.experience || []),
            education: typeof row.education === 'string' ? JSON.parse(row.education) : (row.education || []),
            projects: typeof row.projects === 'string' ? JSON.parse(row.projects) : (row.projects || []),
            status: row.status || 'active',
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
