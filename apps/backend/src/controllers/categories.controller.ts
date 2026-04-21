import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function listCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.query.page || req.query.limit) {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const [data, total] = await Promise.all([
        prisma.category.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
        prisma.category.count(),
      ]);
      return res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
    }
    const data = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ status: 404, error: 'Category not found' });
    res.json({ data: category });
  } catch (err) { next(err); }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = schema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json({ data: category });
  } catch (err) { next(err); }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = schema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ data: category });
  } catch (err) { next(err); }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const linked = await prisma.product.count({ where: { categoryId: req.params.id, isActive: true } });
    if (linked > 0) return res.status(409).json({ status: 409, error: 'Category has linked products' });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Category deleted' } });
  } catch (err) { next(err); }
}
