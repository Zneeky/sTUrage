import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/login', authLimiter, (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/logout', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/me', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
