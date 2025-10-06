import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/register', registerValidation, validate(registerValidation), register);
router.post('/login', loginValidation, validate(loginValidation), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', 
  authenticate,
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please enter a valid phone number'),
  ],
  validate([
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please enter a valid phone number'),
  ]),
  updateProfile
);

router.put('/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validate([
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ]),
  changePassword
);

export default router;
