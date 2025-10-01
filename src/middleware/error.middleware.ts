import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../validators/contact.validator.js';
import type { Logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  constructor(private logger: Logger) {}

  handleError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    this.logger.error('Unhandled error occurred', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        field: error.field
      });
      return;
    }

    // Handle known application errors
    const appError = error as AppError;
    if (appError.isOperational && appError.statusCode) {
      res.status(appError.statusCode).json({
        error: 'Application Error',
        message: error.message
      });
      return;
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      res.status(400).json({
        error: 'Database Error',
        message: 'A database error occurred while processing your request'
      });
      return;
    }

    // Default error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  };

  asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}
