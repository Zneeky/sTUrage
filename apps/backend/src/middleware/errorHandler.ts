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
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target : (typeof target === 'string' ? [target] : []);
      const field = fields[0]?.toString() ?? '';
      const message = duplicateMessageFor(field);
      return res.status(409).json({ status: 409, error: message });
    }
    if (err.code === 'P2025') return res.status(404).json({ status: 404, error: 'Resource not found' });
    if (err.code === 'P2003') {
      const fieldName = (err.meta?.field_name as string | undefined) ?? '';
      const message = fieldName.includes('categoryId')   ? 'Selected category does not exist'
                    : fieldName.includes('supplierId')   ? 'Selected supplier does not exist'
                    : fieldName.includes('warehouseId')  ? 'Selected warehouse does not exist'
                    : fieldName.includes('productId')    ? 'Selected product does not exist'
                    : 'Referenced record does not exist';
      return res.status(400).json({ status: 400, error: message });
    }
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

function duplicateMessageFor(field: string): string {
  switch (field) {
    case 'email':                return 'A user with this email already exists';
    case 'sku':                  return 'A product with this SKU already exists';
    case 'name':                 return 'An entry with this name already exists';
    case 'productId_warehouseId':
    case 'productId,warehouseId':
      return 'Stock entry for this product and warehouse already exists';
    default: return field
      ? `A record with this ${field} already exists`
      : 'A record with these values already exists';
  }
}
