import express from 'express';
import { resumeController } from '../controllers/resumeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticate, resumeController.getResume);
router.get('/user/:userId', authenticate, resumeController.getResumeByUserId);
router.post('/', authenticate, resumeController.updateResume);
router.put('/', authenticate, resumeController.updateResume);

export default router;
