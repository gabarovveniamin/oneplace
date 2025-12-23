import express from 'express';
import { authenticate } from '../middleware/auth';
import { checkChatAccess } from '../middleware/chatAccess';
import {
    sendMessage,
    getMessages,
    getChats,
    markAsRead
} from '../controllers/chatController';

const router = express.Router();

router.get('/', authenticate, getChats); // Get all conversations (no access check needed)
router.get('/:otherUserId', authenticate, checkChatAccess, getMessages); // Get history with a user
router.post('/', authenticate, checkChatAccess, sendMessage); // Send a message
router.post('/:otherUserId/read', authenticate, checkChatAccess, markAsRead); // Mark as read

export default router;
