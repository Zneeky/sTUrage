import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const schema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function listSuppliers(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ data: suppliers });
  } catch (err) { next(err); }
}

export async function getSupplier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const supplier = await prisma.supplier.findFirst({ where: { id: req.params.id, isActive: true } });
    if (!supplier) return res.status(404).json({ status: 404, error: 'Supplier not found' });
    res.json({ data: supplier });
  } catch (err) { next(err); }
}

export async function createSupplier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = schema.parse(req.body);
    const supplier = await prisma.supplier.create({ data });
    res.status(201).json({ data: supplier });
  } catch (err) { next(err); }
}

export async function updateSupplier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = schema.partial().parse(req.body);
    const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data });
    res.json({ data: supplier });
  } catch (err) { next(err); }
}

export async function deleteSupplier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const linked = await prisma.product.count({ where: { supplierId: req.params.id, isActive: true } });
    if (linked > 0) return res.status(409).json({ status: 409, error: 'Supplier has linked products' });
    await prisma.supplier.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ data: { message: 'Supplier deleted' } });
  } catch (err) { next(err); }
}
