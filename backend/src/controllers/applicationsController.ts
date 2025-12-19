import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import database from '../config/database';

// Helper to create notification (internal use)
export const createNotificationInternal = (userId: string, type: string, title: string, message: string, relatedId?: string) => {
    try {
        const stmt = database.prepare(`
            INSERT INTO notifications (user_id, type, title, message, related_id)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(userId, type, title, message, relatedId);
    } catch (err) {
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
        const jobStmt = database.prepare('SELECT posted_by, title FROM jobs WHERE id = ?');
        const job = jobStmt.get(jobId) as { posted_by: string; title: string } | undefined;

        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        // Check if already applied
        const checkStmt = database.prepare('SELECT id FROM applications WHERE user_id = ? AND job_id = ?');
        const existing = checkStmt.get(userId, jobId);

        if (existing) {
            res.status(400).json({ message: 'You have already applied for this job' });
            return;
        }

        // Create application
        const insertStmt = database.prepare(`
            INSERT INTO applications (job_id, user_id, cover_letter)
            VALUES (?, ?, ?)
        `);
        insertStmt.run(jobId, userId, coverLetter);

        // Notify employer
        createNotificationInternal(
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
        const stmt = database.prepare(`
            SELECT a.*, j.title as job_title, j.company, j.location, j.logo
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
        `);
        const applications = stmt.all(userId);
        res.json({ data: applications });
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
        const stmt = database.prepare(`
            SELECT a.*, j.title as job_title, u.first_name, u.last_name, u.email, u.avatar
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            WHERE j.posted_by = ?
            ORDER BY a.created_at DESC
        `);
        const applications = stmt.all(employerId);
        res.json({ data: applications });
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
        const verifyStmt = database.prepare(`
            SELECT a.id, a.user_id, j.title
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ? AND j.posted_by = ?
        `);
        const application = verifyStmt.get(applicationId, employerId) as { id: string; user_id: string; title: string } | undefined;

        if (!application) {
            res.status(404).json({ message: 'Application not found or access denied' });
            return;
        }

        const updateStmt = database.prepare('UPDATE applications SET status = ? WHERE id = ?');
        updateStmt.run(status, applicationId);

        // Notify candidate
        let message = `Статус вашего отклика на вакансию "${application.title}" изменен на: ${status}`;
        if (status === 'viewed') message = `Ваш отклик на вакансию "${application.title}" был просмотрен работодателем.`;
        if (status === 'rejected') message = `К сожалению, работодатель отклонил ваш отклик на вакансию "${application.title}".`;
        if (status === 'accepted') message = `Поздравляем! Ваш отклик на вакансию "${application.title}" одобрен. Работодатель свяжется с вами.`;

        createNotificationInternal(
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
