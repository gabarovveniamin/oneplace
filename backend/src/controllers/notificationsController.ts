import { Request, Response } from 'express';
import database from '../config/database';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT 50
        `);
        const notifications = stmt.all(userId);
        console.log(`🔔 GET /notifications for user ${userId}: Found ${notifications.length} items`);
        res.json({ data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { notificationIds } = req.body; // Array of IDs or 'all'

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        if (notificationIds === 'all') {
            const stmt = database.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
            stmt.run(userId);
        } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            const placeholders = notificationIds.map(() => '?').join(',');
            const stmt = database.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`);
            stmt.run(userId, ...notificationIds);
        }

        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const stmt = database.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
        stmt.run(id, userId);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};
