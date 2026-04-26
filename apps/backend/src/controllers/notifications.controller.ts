import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listNotifications(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });
    res.json({ data: notifications });
  } catch (err) { next(err); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ data: notification });
  } catch (err) { next(err); }
}
