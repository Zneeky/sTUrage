import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const createSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
});

const updateSchema = createSchema.partial();

export async function listWarehouses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const activeOnly = req.query.isActive !== 'false';

    const where = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [total, warehouses] = await Promise.all([
      prisma.warehouse.count({ where }),
      prisma.warehouse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    res.json({ data: warehouses, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: req.params.id } });
    if (!warehouse) return res.status(404).json({ status: 404, error: 'Warehouse not found' });
    res.json({ data: warehouse });
  } catch (err) { next(err); }
}

export async function createWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const warehouse = await prisma.warehouse.create({ data });
    res.status(201).json({ data: warehouse });
  } catch (err) { next(err); }
}

export async function updateWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const warehouse = await prisma.warehouse.update({ where: { id: req.params.id }, data });
    res.json({ data: warehouse });
  } catch (err) { next(err); }
}

export async function deleteWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const activeStock = await prisma.stockItem.count({
      where: { warehouseId: req.params.id, quantity: { gt: 0 } },
    });
    if (activeStock > 0) {
      return res.status(409).json({ status: 409, error: 'Warehouse has active stock items' });
    }
    await prisma.warehouse.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ data: { message: 'Warehouse deactivated' } });
  } catch (err) { next(err); }
}
