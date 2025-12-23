import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { UserModel, User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

// Validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'employer'])
    .withMessage('Role must be either user or employer'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const user = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await UserModel.findByEmail(email, true);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    // Compare password
    const isPasswordValid = await UserModel.comparePassword(password, user.password!);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user as User;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          orgName: user.orgName,
          orgIndustry: user.orgIndustry,
          orgLocation: user.orgLocation,
          orgDescription: user.orgDescription,
          orgWebsite: user.orgWebsite,
          orgEmail: user.orgEmail,
          orgPhone: user.orgPhone,
          orgLogo: user.orgLogo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user as User;
    const { firstName, lastName, phone, avatar, orgName, orgIndustry, orgLocation, orgDescription, orgWebsite, orgEmail, orgPhone, orgLogo } = req.body;

    console.log('updateProfile controller called with body:', req.body);

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (orgName !== undefined) updateData.orgName = orgName;
    if (orgIndustry !== undefined) updateData.orgIndustry = orgIndustry;
    if (orgLocation !== undefined) updateData.orgLocation = orgLocation;
    if (orgDescription !== undefined) updateData.orgDescription = orgDescription;
    if (orgWebsite !== undefined) updateData.orgWebsite = orgWebsite;
    if (orgEmail !== undefined) updateData.orgEmail = orgEmail;
    if (orgPhone !== undefined) updateData.orgPhone = orgPhone;
    if (orgLogo !== undefined) updateData.orgLogo = orgLogo;

    console.log('Constructed updateData:', updateData);

    const updatedUser = await UserModel.update(user.id, updateData);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          lastLogin: updatedUser.lastLogin,
          createdAt: updatedUser.createdAt,
          orgName: updatedUser.orgName,
          orgIndustry: updatedUser.orgIndustry,
          orgLocation: updatedUser.orgLocation,
          orgDescription: updatedUser.orgDescription,
          orgWebsite: updatedUser.orgWebsite,
          orgEmail: updatedUser.orgEmail,
          orgPhone: updatedUser.orgPhone,
          orgLogo: updatedUser.orgLogo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user as User;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userWithPassword = await UserModel.findByEmail(user.email, true);

    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await UserModel.comparePassword(currentPassword, userWithPassword.password!);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    const success = await UserModel.updatePassword(user.id, newPassword);

    if (!success) {
      res.status(500).json({
        success: false,
        message: 'Failed to update password',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
