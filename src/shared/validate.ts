import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { AuthRequest } from './types';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authenticateJwt = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid token', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Unauthorized: Token has expired or is invalid', 401));
  }
};
