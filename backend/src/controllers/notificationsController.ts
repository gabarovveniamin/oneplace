import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const result = await query(`
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 50
        `, [userId]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { notificationIds } = req.body; // Array of IDs or 'all'

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        if (notificationIds === 'all') {
            await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
        } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            const placeholders = notificationIds.map((_, i) => `$${i + 2}`).join(',');
            await query(
                `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND id IN (${placeholders})`,
                [userId, ...notificationIds]
            );
        }

        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};
