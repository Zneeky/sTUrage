import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';
import stockMovementRoutes from './stockMovement.routes';
import warehouseRoutes from './warehouse.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/warehouses', warehouseRoutes);

export default router;
