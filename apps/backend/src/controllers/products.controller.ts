import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const createSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  supplierId: z.string().optional(),
  unit: z.string().default('pcs'),
  minStock: z.number().int().min(0).default(0),
});

const updateSchema = createSchema.partial();

const productSelect = {
  id: true, sku: true, name: true, description: true, unit: true, minStock: true,
  isActive: true, createdAt: true, updatedAt: true,
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  stockItems: {
    where: { warehouse: { isActive: true } },
    select: { quantity: true, warehouse: { select: { id: true, name: true } } },
  },
};

export async function listProducts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const supplierId = req.query.supplierId as string | undefined;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (status === 'deleted') where.isActive = false;
    else where.isActive = true;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, select: productSelect, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findFirst({ where: { id: req.params.id, isActive: true }, select: productSelect });
    if (!product) return res.status(404).json({ status: 404, error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const product = await prisma.product.create({ data, select: productSelect });
    res.status(201).json({ data: product });
  } catch (err) { next(err); }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data, select: productSelect });
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ data: { message: 'Product deleted' } });
  } catch (err) { next(err); }
}
