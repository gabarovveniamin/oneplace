import { Router } from 'express';
import {
  getJobs,
  getJobById,
  searchJobs,
  createJob,
  updateJob,
  deleteJob,
  getPopularJobs,
  getRecentJobs,
  getJobsStats,
  getUserJobs,
  createJobValidation,
  updateJobValidation,
  searchJobsValidation,
} from '../controllers/jobController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', searchJobsValidation, validate(searchJobsValidation), getJobs);
router.get('/search', searchJobsValidation, validate(searchJobsValidation), searchJobs);
router.get('/popular', getPopularJobs);
router.get('/recent', getRecentJobs);
router.get('/stats', getJobsStats);
router.get('/:id', optionalAuth, getJobById);

// Protected routes
router.post('/', 
  authenticate, 
  authorize('user', 'employer', 'admin'),
  createJobValidation, 
  validate(createJobValidation), 
  createJob
);

router.put('/:id', 
  authenticate, 
  updateJobValidation, 
  validate(updateJobValidation), 
  updateJob
);

router.delete('/:id', 
  authenticate, 
  deleteJob
);

// User jobs routes
router.get('/users/me/jobs', authenticate, getUserJobs);
router.get('/users/:userId/jobs', authenticate, getUserJobs);

export default router;
