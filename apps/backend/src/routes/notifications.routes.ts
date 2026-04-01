import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNotifications, markRead } from '../controllers/notifications.controller';

const router = Router();

router.get('/', authenticate, listNotifications);
router.patch('/:id/read', authenticate, markRead);

export default router;
