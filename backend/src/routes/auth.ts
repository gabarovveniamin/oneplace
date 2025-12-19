import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  getUserById,
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
router.get('/users/:userId', authenticate, getUserById);
router.put('/profile',
  authenticate,
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
      .custom((value) => {
        // Allow empty string 
        if (!value || value === '') return true;
        // Allow pure digits (which frontend sends now) OR formatted phone
        // Remove everything except digits and +
        const cleaned = value.replace(/[^0-9+]/g, '');
        return cleaned.length >= 5 && cleaned.length <= 15;
      })
      .withMessage('Please enter a valid phone number'),
    body('avatar')
      .optional()
      .isString()
      .withMessage('Avatar must be a string'),
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
