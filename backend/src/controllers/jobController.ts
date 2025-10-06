import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import Job, { IJob } from '../models/Job';
import { createError } from '../middleware/errorHandler';

// Validation rules
export const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Job title is required and must be less than 100 characters'),
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name is required and must be less than 100 characters'),
  body('salary')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Salary is required'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required and must be less than 100 characters'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'daily', 'projects', 'travel'])
    .withMessage('Invalid job type'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description is required and must be less than 5000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('salaryFrom')
    .optional()
    .isNumeric()
    .withMessage('Salary from must be a number'),
  body('salaryTo')
    .optional()
    .isNumeric()
    .withMessage('Salary to must be a number'),
  body('workHours')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Work hours must be between 1 and 24'),
];

export const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Job title must be less than 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  body('workHours')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Work hours must be between 1 and 24'),
];

export const searchJobsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('salaryFrom')
    .optional()
    .isNumeric()
    .withMessage('Salary from must be a number'),
  query('salaryTo')
    .optional()
    .isNumeric()
    .withMessage('Salary to must be a number'),
  query('workHours')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Work hours must be between 1 and 24'),
];

// Get all jobs with pagination and filtering
export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };
    
    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }

    // Execute query
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email');

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Search jobs with advanced filters
export const searchJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    // Text search
    if (req.query.keyword) {
      filter.$text = { $search: req.query.keyword as string };
    }

    // Exact matches
    const exactMatchFields = [
      'specialization', 'industry', 'region', 'type', 'salaryFrequency',
      'education', 'experience', 'employmentType', 'schedule', 'workFormat'
    ];

    exactMatchFields.forEach(field => {
      if (req.query[field]) {
        filter[field] = req.query[field];
      }
    });

    // Range filters
    if (req.query.salaryFrom || req.query.salaryTo) {
      filter.salaryFrom = {};
      if (req.query.salaryFrom) {
        filter.salaryFrom.$gte = parseInt(req.query.salaryFrom as string);
      }
      if (req.query.salaryTo) {
        filter.salaryTo = { $lte: parseInt(req.query.salaryTo as string) };
      }
    }

    if (req.query.workHours) {
      filter.workHours = parseInt(req.query.workHours as string);
    }

    // Execute query
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName email')
      .sort(req.query.keyword ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new job
export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const jobData = {
      ...req.body,
      postedBy: user._id,
    };

    const job = new Job(jobData);
    await job.save();

    await job.populate('postedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Update job
export const updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
      return;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// Delete job
export const deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
      return;
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get popular jobs
export const getPopularJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const jobs = await Job.find({ isActive: true })
      .populate('postedBy', 'firstName lastName email')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// Get recent jobs
export const getRecentJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const jobs = await Job.find({ isActive: true })
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// Get jobs statistics
export const getJobsStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const total = await Job.countDocuments({ isActive: true });
    
    const byType = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const byIndustry = await Job.aggregate([
      { $match: { isActive: true, industry: { $exists: true, $ne: null } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
    ]);

    const byRegion = await Job.aggregate([
      { $match: { isActive: true, region: { $exists: true, $ne: null } } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byIndustry: byIndustry.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byRegion: byRegion.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's jobs
export const getUserJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = req.params.userId || user._id;

    // Check if user is requesting their own jobs or is admin
    if (userId !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view these jobs',
      });
      return;
    }

    const jobs = await Job.find({ postedBy: userId })
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};
