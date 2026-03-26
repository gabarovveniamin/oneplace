import { Router } from 'express';
import { servicesController } from '../controllers/servicesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', servicesController.getServices);
router.get('/user/:userId', servicesController.getUserServices);
router.get('/:id', servicesController.getServiceById);

router.post('/', authenticate, servicesController.createService);
router.delete('/:id', authenticate, servicesController.deleteService);

export default router;