import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    sendMessage,
    getMessages,
    getChats,
    markAsRead
} from '../controllers/chatController';

const router = express.Router();

router.get('/', authenticate, getChats); // Get all conversations
router.get('/:otherUserId', authenticate, getMessages); // Get history with a user
router.post('/', authenticate, sendMessage); // Send a message
router.post('/:otherUserId/read', authenticate, markAsRead); // Mark as read

export default router;
