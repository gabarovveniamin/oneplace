import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { socketManager } from '../socket';

// Helper to create notification (internal use)
export const createNotificationInternal = async (userId: string, type: string, title: string, message: string, relatedId?: string) => {
    try {
        const result = await query(`
            INSERT INTO notifications (user_id, type, title, message, related_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, created_at
        `, [userId, type, title, message, relatedId || null]);

        const newNotification = result.rows[0];

        // Push notification via Socket.IO
        socketManager.sendToUser(userId, 'notification', {
            id: newNotification.id,
            user_id: userId,
            type,
            title,
            message,
            related_id: relatedId,
            is_read: false,
            created_at: newNotification.created_at
        });
    } catch (err) {
        console.error('Failed to create notification or send via socket', err);
        // Silent fail for notifications to not break main flow
    }
};

export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // Check if job exists and get employer ID
        const jobResult = await query('SELECT posted_by, title FROM jobs WHERE id = $1', [jobId]);
        const job = jobResult.rows[0] as { posted_by: string; title: string } | undefined;

        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        // Check if already applied
        const checkResult = await query('SELECT id FROM applications WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
        const existing = checkResult.rows[0];

        if (existing) {
            res.status(400).json({ message: 'You have already applied for this job' });
            return;
        }

        // Create application
        await query(`
            INSERT INTO applications (job_id, user_id, cover_letter)
            VALUES ($1, $2, $3)
        `, [jobId, userId, coverLetter]);

        // Notify employer
        await createNotificationInternal(
            job.posted_by,
            'new_application',
            'Новый отклик',
            `Поступил новый отклик на вакансию "${job.title}"`,
            jobId
        );

        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit application' });
    }
};

export const getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const result = await query(`
            SELECT a.*, j.title as job_title, j.company, j.location, j.logo
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        `, [userId]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
};

// For employers to see who applied to their jobs
export const getEmployerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    const employerId = req.user?.id;

    if (!employerId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const result = await query(`
            SELECT a.*, j.title as job_title, u.first_name, u.last_name, u.email, u.avatar
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            WHERE j.posted_by = $1
            ORDER BY a.created_at DESC
        `, [employerId]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const employerId = req.user?.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!employerId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // Verify ownership
        const verifyResult = await query(`
            SELECT a.id, a.user_id, j.title
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = $1 AND j.posted_by = $2
        `, [applicationId, employerId]);

        const application = verifyResult.rows[0] as { id: string; user_id: string; title: string } | undefined;

        if (!application) {
            res.status(404).json({ message: 'Application not found or access denied' });
            return;
        }

        await query('UPDATE applications SET status = $1 WHERE id = $2', [status, applicationId]);

        // Notify candidate
        let message = `Статус вашего отклика на вакансию "${application.title}" изменен на: ${status}`;
        if (status === 'viewed') message = `Ваш отклик на вакансию "${application.title}" был просмотрен работодателем.`;
        if (status === 'rejected') message = `К сожалению, работодатель отклонил ваш отклик на вакансию "${application.title}".`;
        if (status === 'accepted') message = `Поздравляем! Ваш отклик на вакансию "${application.title}" одобрен. Работодатель свяжется с вами.`;

        await createNotificationInternal(
            application.user_id,
            'application_status',
            'Изменение статуса отклика',
            message,
            applicationId
        );

        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status' });
    }
};
