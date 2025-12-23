import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export const addToFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        await query('INSERT INTO favorites (user_id, job_id) VALUES ($1, $2)', [userId, jobId]);
        res.status(201).json({ message: 'Added to favorites' });
    } catch (err: unknown) {
        const error = err as any;
        // Postgres unique constraint violation code
        if (error.code === '23505') {
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
        const result = await query('DELETE FROM favorites WHERE user_id = $1 AND job_id = $2', [userId, jobId]);

        if (result.rowCount > 0) {
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
        const result = await query(`
            SELECT j.*, u.id as posted_by_id, u.first_name, u.last_name, u.email
            FROM jobs j
            JOIN favorites f ON j.id = f.job_id
            LEFT JOIN users u ON j.posted_by = u.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `, [userId]);

        const jobs = result.rows.map((row: Record<string, any>) => ({
            id: row.id,
            title: row.title,
            company: row.company,
            salary: row.salary,
            location: row.location,
            type: row.type,
            description: row.description,
            tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
            logo: row.logo,
            postedBy: row.posted_by,
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
        const result = await query('SELECT job_id FROM favorites WHERE user_id = $1', [userId]);
        const ids = result.rows.map((row: Record<string, any>) => row.job_id);
        res.json({ data: ids });
    } catch (err: unknown) {
        res.status(500).json({ message: 'Failed to fetch favorite IDs' });
    }
}
