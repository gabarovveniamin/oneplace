import { Request, Response } from 'express';
import pool from '../config/database';
import { createNotification } from '../utils/notifications';

// Отправить заявку в друзья
export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { friendId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!friendId) {
            return res.status(400).json({ success: false, message: 'Friend ID is required' });
        }

        if (userId === friendId) {
            return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
        }

        // Проверяем, существует ли уже заявка
        const existingRequest = await pool.query(
            'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
            [userId, friendId]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Friend request already exists' });
        }

        // Создаём заявку
        const result = await pool.query(
            'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, friendId, 'pending']
        );

        // Отправляем уведомление получателю
        try {
            const senderResult = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
            const sender = senderResult.rows[0];
            const senderName = sender ? `${sender.first_name} ${sender.last_name}` : 'Пользователь';

            await createNotification(
                friendId,
                'friend_request',
                'Новая заявка в друзья',
                `${senderName} хочет добавить вас в друзья`,
                result.rows[0].id
            );
        } catch (notifyError) {
            console.error('Failed to send friend request notification:', notifyError);
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send friend request',
            details: error.message
        });
    }
}

// Принять заявку в друзья
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { requestId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Обновляем статус заявки (только если текущий пользователь - получатель)
        const result = await pool.query(
            'UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND friend_id = $3 AND status = $4 RETURNING *',
            ['accepted', requestId, userId, 'pending']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Friend request not found or already processed' });
        }

        const friendship = result.rows[0];

        // Отправляем уведомление отправителю заявки
        try {
            const accepterResult = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
            const accepter = accepterResult.rows[0];
            const accepterName = accepter ? `${accepter.first_name} ${accepter.last_name}` : 'Пользователь';

            await createNotification(
                friendship.user_id, // Тот, кто отправил заявку изначально
                'friend_accept',
                'Заявка принята',
                `${accepterName} принял вашу заявку в друзья`,
                friendship.id
            );
        } catch (notifyError) {
            console.error('Failed to send friend accept notification:', notifyError);
        }

        return res.json({ success: true, data: friendship });
    } catch (error: any) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to accept friend request',
            details: error.message
        });
    }
}

// Отклонить заявку в друзья
export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { requestId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Обновляем статус заявки или удаляем её
        const result = await pool.query(
            'DELETE FROM friendships WHERE id = $1 AND (user_id = $2 OR friend_id = $2) AND status = $3 RETURNING *',
            [requestId, userId, 'pending']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Friend request not found' });
        }

        return res.json({ success: true, message: 'Friend request rejected/cancelled' });
    } catch (error: any) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ success: false, message: 'Failed to reject friend request' });
    }
};

// Удалить из друзей
export const removeFriend = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { friendId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Удаляем дружбу (в любом направлении)
        const result = await pool.query(
            'DELETE FROM friendships WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)) AND status = $3 RETURNING *',
            [userId, friendId, 'accepted']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Friendship not found' });
        }

        return res.json({ success: true, message: 'Friend removed successfully' });
    } catch (error: any) {
        console.error('Error removing friend:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove friend' });
    }
};

// Получить список друзей
export const getFriends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const result = await pool.query(
            `SELECT 
                u.id, u.first_name, u.last_name, u.email, u.role, u.avatar,
                f.created_at as friendship_date
            FROM friendships f
            JOIN users u ON (
                CASE 
                    WHEN f.user_id = $1 THEN u.id = f.friend_id
                    ELSE u.id = f.user_id
                END
            )
            WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = $2
            ORDER BY f.created_at DESC`,
            [userId, 'accepted']
        );

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Error getting friends:', error);
        return res.status(500).json({ success: false, message: 'Failed to get friends' });
    }
};

// Получить входящие заявки в друзья
export const getIncomingRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const result = await pool.query(
            `SELECT 
                f.id as request_id,
                u.id, u.first_name, u.last_name, u.email, u.role, u.avatar,
                f.created_at
            FROM friendships f
            JOIN users u ON u.id = f.user_id
            WHERE f.friend_id = $1 AND f.status = $2
            ORDER BY f.created_at DESC`,
            [userId, 'pending']
        );

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Error getting incoming requests:', error);
        return res.status(500).json({ success: false, message: 'Failed to get incoming requests' });
    }
};

// Получить исходящие заявки в друзья
export const getOutgoingRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const result = await pool.query(
            `SELECT 
                f.id as request_id,
                u.id, u.first_name, u.last_name, u.email, u.role, u.avatar,
                f.created_at
            FROM friendships f
            JOIN users u ON u.id = f.friend_id
            WHERE f.user_id = $1 AND f.status = $2
            ORDER BY f.created_at DESC`,
            [userId, 'pending']
        );

        return res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Error getting outgoing requests:', error);
        return res.status(500).json({ success: false, message: 'Failed to get outgoing requests' });
    }
};

// Проверить статус дружбы с пользователем
export const getFriendshipStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { targetUserId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const result = await pool.query(
            `SELECT 
                id,
                CASE 
                    WHEN user_id = $1 THEN 'outgoing'
                    WHEN friend_id = $1 THEN 'incoming'
                END as direction,
                status
            FROM friendships
            WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
            [userId, targetUserId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, data: { status: 'none' } });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Error getting friendship status:', error);
        return res.status(500).json({ success: false, message: 'Failed to get friendship status' });
    }
};
