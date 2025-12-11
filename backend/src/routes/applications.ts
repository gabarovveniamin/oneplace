import express from 'express';
import { authenticate } from '../middleware/auth';
import {
    applyForJob,
    getUserApplications,
    getEmployerApplications,
    updateApplicationStatus
} from '../controllers/applicationsController';

const router = express.Router();

// Apply for a job
router.post('/jobs/:jobId/apply', authenticate, applyForJob);

// Get my applications (as a candidate)
router.get('/my', authenticate, getUserApplications);

// Get applications for my jobs (as an employer)
router.get('/employer', authenticate, getEmployerApplications);

// Update application status (as an employer)
router.patch('/:applicationId/status', authenticate, updateApplicationStatus);

export default router;
