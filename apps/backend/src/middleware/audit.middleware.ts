import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { AuthRequest } from './auth';

const ENTITY_MAP: Record<string, string> = {
  products: 'Product',
  categories: 'Category',
  suppliers: 'Supplier',
  warehouses: 'Warehouse',
  users: 'User',
  'stock-movements': 'StockMovement',
};

function entityFromPath(path: string): string {
  const segment = path.split('/').find((p) => ENTITY_MAP[p]);
  return segment ? ENTITY_MAP[segment] : 'Unknown';
}

export function auditLog(req: AuthRequest, res: Response, next: NextFunction) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  res.on('finish', () => {
    if (!req.user) return;
    prisma.auditLog
      .create({
        data: {
          userId: req.user!.id,
          action: `${req.method} ${req.path}`,
          entity: entityFromPath(req.path),
          entityId: req.params.id ?? null,
          payload: req.body ?? null,
        },
      })
      .catch((err: unknown) => logger.error('Audit log failed', { err }));
  });

  next();
}
