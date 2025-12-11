import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAllUsers, deleteUser, deleteJob, getAllJobs } from '../controllers/adminController';

const router = Router();

// Все маршруты защищены и требуют роли admin
router.use(authenticate, authorize('admin'));

// Пользователи
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Вакансии (можно удалять любые)
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

export default router;
