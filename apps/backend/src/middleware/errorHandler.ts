import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  details?: Record<string, string[]>;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  res.status(status).json({
    status,
    error: err.message || 'Internal server error',
    ...(err.details && { details: err.details }),
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ status: 404, error: 'Route not found' });
}
