import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    getNotifications,
    markAsRead,
    deleteNotification
} from '../controllers/notificationsController';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.post('/mark-read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
