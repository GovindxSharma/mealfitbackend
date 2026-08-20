import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createErrorResponse } from './types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`🚨 Error [${req.method} ${req.originalUrl}]:`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json(createErrorResponse(formattedErrors, 'Validation Error'));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(createErrorResponse(err.message));
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json(createErrorResponse(`A record with this ${field} already exists.`));
    return;
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error occurred' 
    : (err.message || 'Unknown server error');

  res.status(500).json(createErrorResponse(message));
};
