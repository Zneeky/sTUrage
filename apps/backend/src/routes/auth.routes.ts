import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { login, register, logout, me } from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
