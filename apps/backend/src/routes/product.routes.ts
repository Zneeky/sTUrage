import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller';

const router = Router();

router.get('/', authenticate, listProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
