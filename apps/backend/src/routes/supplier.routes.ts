import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '../controllers/suppliers.controller';

const router = Router();

router.get('/', authenticate, listSuppliers);
router.get('/:id', authenticate, getSupplier);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createSupplier);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateSupplier);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSupplier);

export default router;
