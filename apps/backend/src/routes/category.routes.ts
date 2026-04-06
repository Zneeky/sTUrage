import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller';

const router = Router();

router.get('/', authenticate, listCategories);
router.get('/:id', authenticate, getCategory);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
