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
  validate([
    body('firstName')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 })
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
        return cleaned.length >= 1 && cleaned.length <= 15;
      })
      .withMessage('Please enter a valid phone number'),
    body('avatar')
      .optional()
      .isString()
      .withMessage('Avatar must be a string'),
    body('orgName')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Organization name must be less than 100 characters'),
    body('orgIndustry')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }),
    body('orgLocation')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 }),
    body('orgDescription')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 2000 }),
    body('orgWebsite')
      .optional({ checkFalsy: true })
      .trim(),
    body('orgEmail')
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Invalid organization email'),
    body('orgPhone')
      .optional({ checkFalsy: true })
      .trim()
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
