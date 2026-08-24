import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (error: string, message?: string): ApiResponse => ({
  success: false,
  error,
  message,
  timestamp: new Date().toISOString(),
});
