import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { socketManager } from '../socket';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!senderId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    if (!receiverId || !content) {
        res.status(400).json({ message: 'Receiver and content are required' });
        return;
    }

    try {
        const result = await query(`
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, created_at
        `, [senderId, receiverId, content]);

        const newMessage = result.rows[0];

        const messageData = {
            id: newMessage.id,
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            is_read: false,
            created_at: newMessage.created_at
        };

        // Emit to receiver
        socketManager.sendToUser(receiverId, 'new_message', messageData);
        // Also emit to sender (for sync across multiple tabs if any)
        socketManager.sendToUser(senderId, 'new_message', messageData);

        res.status(201).json({ data: messageData });
    } catch (err) {
        console.error('Failed to send message:', err);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const result = await query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `, [userId, otherUserId]);

        // Mark as read
        await query(`
            UPDATE messages SET is_read = TRUE 
            WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE
        `, [userId, otherUserId]);

        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // This query finds all unique users the current user has chatted with
        // and returns their info along with the last message
        const result = await query(`
            WITH LastMessages AS (
                SELECT 
                    CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as other_user_id,
                    content,
                    created_at,
                    is_read,
                    sender_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END 
                        ORDER BY created_at DESC
                    ) as rn
                FROM messages
                WHERE sender_id = $1 OR receiver_id = $1
            )
            SELECT 
                lm.other_user_id,
                lm.content as last_message,
                lm.created_at as last_message_at,
                lm.is_read,
                lm.sender_id,
                u.first_name,
                u.last_name,
                u.avatar,
                (SELECT COUNT(*)::int FROM messages WHERE receiver_id = $1 AND sender_id = lm.other_user_id AND is_read = FALSE) as unread_count
            FROM LastMessages lm
            JOIN users u ON lm.other_user_id = u.id
            WHERE lm.rn = 1
            ORDER BY lm.created_at DESC
        `, [userId]);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('Failed to fetch chats:', err);
        res.status(500).json({ message: 'Failed to fetch chats' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        await query(`
            UPDATE messages SET is_read = TRUE 
            WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE
        `, [userId, otherUserId]);
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
};
