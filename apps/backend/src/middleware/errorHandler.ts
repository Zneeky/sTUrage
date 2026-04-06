import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from '../utils/logger';

export interface AppError extends Error {
  status?: number;
  details?: Record<string, string[]>;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'value';
      (details[key] ??= []).push(issue.message);
    }
    return res.status(422).json({ status: 422, error: 'Validation failed', details });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ status: 409, error: 'Resource already exists' });
    if (err.code === 'P2025') return res.status(404).json({ status: 404, error: 'Resource not found' });
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return res.status(401).json({ status: 401, error: 'Invalid or expired token' });
  }

  const appErr = err as AppError;
  const status = appErr.status || 500;

  if (status >= 500) {
    logger.error('Internal error', { message: appErr.message, stack: appErr.stack });
  }

  res.status(status).json({
    status,
    error: status >= 500 ? 'Internal server error' : (appErr.message || 'Unknown error'),
    ...(appErr.details && { details: appErr.details }),
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ status: 404, error: 'Route not found' });
}
