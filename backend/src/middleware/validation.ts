import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    const errorDetails = errors.array().map(err => `${err.type === 'field' ? err.path : 'unknown'}: ${err.msg}`).join(', ');
    res.status(400).json({
      success: false,
      message: `Validation failed: ${errorDetails}`,
      errors: errors.array(),
    });
    return;
  }

  next();
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));
    handleValidationErrors(req, res, next);
  };
};
