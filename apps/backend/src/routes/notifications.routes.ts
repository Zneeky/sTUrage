import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';
import { isBlacklisted } from '../utils/tokenBlacklist';
import { addClient, removeClient } from '../services/sseClients';
import {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notifications.controller';

const router = Router();

// SSE stream — EventSource can't set Authorization headers, so token comes
// as a query param for this one endpoint only.
router.get('/stream', (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) return res.status(401).json({ status: 401, error: 'No token provided' });
  if (isBlacklisted(token)) return res.status(401).json({ status: 401, error: 'Token has been invalidated' });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  } catch {
    return res.status(401).json({ status: 401, error: 'Invalid or expired token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep-alive ping every 30 s so proxies don't close the connection.
  const ping = setInterval(() => res.write(': ping\n\n'), 30000);

  addClient(res);

  req.on('close', () => {
    clearInterval(ping);
    removeClient(res);
  });
});

router.get('/', authenticate, listNotifications);
router.patch('/read-all', authenticate, markAllRead);
router.patch('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
