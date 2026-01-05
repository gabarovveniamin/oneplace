import { Router } from 'express';
import { marketController } from '../controllers/marketController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', marketController.getListings);
router.get('/user/:userId', marketController.getUserListings);

// Protected routes
router.post('/', authenticate, marketController.createListing);
router.delete('/:id', authenticate, marketController.deleteListing);

export default router;
