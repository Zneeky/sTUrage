import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouse.controller';

const router = Router();

router.get('/', authenticate, listWarehouses);
router.get('/:id', authenticate, getWarehouse);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createWarehouse);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateWarehouse);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteWarehouse);

export default router;
