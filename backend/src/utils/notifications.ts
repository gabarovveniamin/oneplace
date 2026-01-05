import { query } from '../config/database';
import { socketManager } from '../socket';

export const createNotification = async (userId: string, type: string, title: string, message: string, relatedId?: string) => {
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

        return newNotification;
    } catch (err) {
        console.error('Failed to create notification or send via socket', err);
        // Silent fail for notifications to not break main flow
        return null;
    }
};
