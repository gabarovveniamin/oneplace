import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addToFavorites, removeFromFavorites, getFavorites, getFavoriteIds } from '../controllers/favoritesController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getFavorites);
router.get('/ids', getFavoriteIds);
router.post('/:jobId', addToFavorites);
router.delete('/:jobId', removeFromFavorites);

export default router;
