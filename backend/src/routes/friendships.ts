import express from 'express';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    getFriendshipStatus
} from '../controllers/friendshipController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticate);

// Отправить заявку в друзья
router.post('/request', sendFriendRequest);

// Принять заявку в друзья
router.post('/accept/:requestId', acceptFriendRequest);

// Отклонить заявку в друзья
router.delete('/reject/:requestId', rejectFriendRequest);

// Удалить из друзей
router.delete('/:friendId', removeFriend);

// Получить список друзей
router.get('/', getFriends);

// Получить входящие заявки
router.get('/requests/incoming', getIncomingRequests);

// Получить исходящие заявки
router.get('/requests/outgoing', getOutgoingRequests);

// Проверить статус дружбы с конкретным пользователем
router.get('/status/:targetUserId', getFriendshipStatus);

export default router;
