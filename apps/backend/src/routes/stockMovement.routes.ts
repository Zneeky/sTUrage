import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listTransactions, getTransaction, createTransaction } from '../controllers/transactions.controller';

const router = Router();

router.get('/', authenticate, listTransactions);
router.get('/:id', authenticate, getTransaction);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'OPERATOR'), createTransaction);

export default router;
