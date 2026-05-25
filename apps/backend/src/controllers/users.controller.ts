import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const userSelect = { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true, createdAt: true };

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
});

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' } }),
      prisma.user.count({ where }),
    ]);
    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
    if (!user) return res.status(404).json({ status: 404, error: 'User not found' });
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existing) return res.status(409).json({ status: 409, error: 'A user with this email already exists' });
    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { ...data, password }, select: userSelect });
    res.status(201).json({ data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    if (data.email) {
      const conflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: req.params.id } }, select: { id: true } });
      if (conflict) return res.status(409).json({ status: 409, error: 'A user with this email already exists' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: userSelect });
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ status: 400, error: 'Cannot deactivate yourself' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: userSelect });
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function activateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true }, select: userSelect });
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function listAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}
