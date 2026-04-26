import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../utils/tokenBlacklist';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 401, error: 'No token provided' });

  if (isBlacklisted(token)) {
    return res.status(401).json({ status: 401, error: 'Token has been invalidated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as {
      id: string; email: string; role: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ status: 401, error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 403, error: 'Insufficient permissions' });
    }
    next();
  };
}
