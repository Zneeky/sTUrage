import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit.middleware';
import { listUsers, getUser, createUser, updateUser, deactivateUser, listAuditLogs } from '../controllers/users.controller';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), listUsers);
router.get('/audit-log', authenticate, authorize('ADMIN'), listAuditLogs);
router.get('/:id', authenticate, authorize('ADMIN'), getUser);
router.post('/', authenticate, authorize('ADMIN'), auditLog, createUser);
router.put('/:id', authenticate, authorize('ADMIN'), auditLog, updateUser);
router.patch('/:id/deactivate', authenticate, authorize('ADMIN'), auditLog, deactivateUser);

export default router;
