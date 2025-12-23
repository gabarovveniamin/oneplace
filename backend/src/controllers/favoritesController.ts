import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import database from '../config/database';

export const addToFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare('INSERT INTO favorites (user_id, job_id) VALUES (?, ?)');
        stmt.run(userId, jobId);
        res.status(201).json({ message: 'Added to favorites' });
    } catch (err: unknown) {
        const error = err as any;
        if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            res.status(400).json({ message: 'Already in favorites' });
        } else {
            res.status(500).json({ message: 'Failed to add to favorites' });
        }
    }
};

export const removeFromFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare('DELETE FROM favorites WHERE user_id = ? AND job_id = ?');
        const result = stmt.run(userId, jobId);

        if (result.changes > 0) {
            res.json({ message: 'Removed from favorites' });
        } else {
            res.status(404).json({ message: 'Favorite not found' });
        }
    } catch (err: unknown) {
        res.status(500).json({ message: 'Failed to remove from favorites' });
    }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare(`
            SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
            FROM jobs j
            JOIN favorites f ON j.id = f.job_id
            LEFT JOIN users u ON j.posted_by = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `);

        const rows = stmt.all(userId);

        // Map database rows to response objects (similar to jobController)
        const jobs = rows.map((row: Record<string, any>) => ({
            id: row.id,
            title: row.title,
            company: row.company,
            salary: row.salary,
            location: row.location,
            type: row.type,
            description: row.description,
            tags: row.tags ? JSON.parse(row.tags) : [],
            logo: row.logo,
            postedBy: row.posted_by, // Legacy ID field
            postedByUser: {
                id: row.posted_by_id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email
            },
            isActive: Boolean(row.is_active),
            isFeatured: Boolean(row.is_featured),
            views: row.views,
            applications: row.applications,
            expiresAt: row.expires_at,
            createdAt: row.created_at,

            // Extended fields
            specialization: row.specialization,
            industry: row.industry,
            region: row.region,
            salaryFrom: row.salary_from,
            salaryTo: row.salary_to,
            salaryFrequency: row.salary_frequency,
            education: row.education,
            experience: row.experience,
            employmentType: row.employment_type,
            schedule: row.schedule,
            workHours: row.work_hours,
            workFormat: row.work_format,
        }));

        res.json({ data: jobs });
    } catch (err: unknown) {
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
};

export const getFavoriteIds = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare('SELECT job_id FROM favorites WHERE user_id = ?');
        const rows = stmt.all(userId);
        const ids = rows.map((row: Record<string, any>) => row.job_id);
        res.json({ data: ids });
    } catch (err: unknown) {
        res.status(500).json({ message: 'Failed to fetch favorite IDs' });
    }
}
