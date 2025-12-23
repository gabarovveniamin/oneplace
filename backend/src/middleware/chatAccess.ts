import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { query } from '../config/database';

/**
 * Middleware для проверки доступа к чату
 * Пользователи могут общаться только если между ними есть application
 */
export const checkChatAccess = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { otherUserId, receiverId } = req.params.otherUserId ? { otherUserId: req.params.otherUserId, receiverId: null } : { otherUserId: null, receiverId: req.body.receiverId };
    const targetUserId = otherUserId || receiverId;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    if (!targetUserId) {
        res.status(400).json({ message: 'Target user ID is required' });
        return;
    }

    try {
        // Проверяем, есть ли application между пользователями
        // Либо текущий пользователь подал отклик работодателю
        // Либо работодатель получил отклик от текущего пользователя
        const result = await query(`
            SELECT a.id 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE (
                (a.user_id = $1 AND j.posted_by = $2) OR
                (a.user_id = $2 AND j.posted_by = $1)
            )
            LIMIT 1
        `, [userId, targetUserId]);

        if (result.rows.length === 0) {
            res.status(403).json({
                message: 'Access denied. You can only chat with users you have applications with.'
            });
            return;
        }

        // Доступ разрешён
        next();
    } catch (err) {
        console.error('Chat access check failed:', err);
        res.status(500).json({ message: 'Failed to verify chat access' });
    }
};
