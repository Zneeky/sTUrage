import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { currentStockReport, movementReport, lowStockReport } from '../controllers/reports.controller';

const router = Router();

router.get('/current-stock', authenticate, authorize('ADMIN', 'MANAGER'), currentStockReport);
router.get('/movement', authenticate, authorize('ADMIN', 'MANAGER'), movementReport);
router.get('/low-stock', authenticate, authorize('ADMIN', 'MANAGER'), lowStockReport);

export default router;
