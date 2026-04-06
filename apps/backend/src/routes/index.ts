import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';
import stockMovementRoutes from './stockMovement.routes';
import warehouseRoutes from './warehouse.routes';
import notificationRoutes from './notifications.routes';
import reportsRoutes from './reports.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', usersRoutes);

export default router;
