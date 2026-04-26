import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { blacklistToken, isBlacklisted } from '../utils/tokenBlacklist';
import { AuthRequest } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
});

function signToken(payload: { id: string; email: string; role: string }): string {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 401, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ status: 401, error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ data: { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } } });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { email: data.email, password, firstName: data.firstName, lastName: data.lastName, role: data.role ?? 'OPERATOR' },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ data: { token, user } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        const remainingMs = decoded.exp * 1000 - Date.now();
        if (remainingMs > 0) blacklistToken(token, remainingMs);
      }
    }
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ status: 404, error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export { isBlacklisted };
