import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { checkLowStock } from '../services/notification.service';

const createSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  type: z.enum(['INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER']),
  quantity: z.number().int().positive(),
  targetWarehouseId: z.string().optional(),
  note: z.string().optional(),
});

export async function createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, warehouseId, type, quantity, targetWarehouseId, note } = createSchema.parse(req.body);

    if (type === 'TRANSFER') {
      if (!targetWarehouseId) {
        return res.status(422).json({ status: 422, error: 'Target warehouse is required for transfers' });
      }
      if (targetWarehouseId === warehouseId) {
        return res.status(422).json({ status: 422, error: 'Source and target warehouse must be different' });
      }
    }

    // For OUTBOUND / TRANSFER check sufficient stock
    if (type === 'OUTBOUND' || type === 'TRANSFER') {
      const stockItem = await prisma.stockItem.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      });
      const current = stockItem?.quantity ?? 0;
      if (current < quantity) {
        return res.status(422).json({
          status: 422,
          error: `Not enough stock — only ${current} available, ${quantity} requested`,
          current,
          requested: quantity,
        });
      }
    }

    const [movement] = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const mv = await tx.stockMovement.create({
        data: {
          type,
          quantity,
          note,
          productId,
          createdById: req.user!.id,
          sourceWarehouseId: ['OUTBOUND', 'TRANSFER', 'ADJUSTMENT'].includes(type) ? warehouseId : null,
          targetWarehouseId: ['INBOUND', 'TRANSFER'].includes(type) ? (targetWarehouseId ?? warehouseId) : null,
        },
      });

      // Update StockItem quantities atomically
      if (type === 'INBOUND') {
        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId, warehouseId: targetWarehouseId ?? warehouseId } },
          update: { quantity: { increment: quantity } },
          create: { productId, warehouseId: targetWarehouseId ?? warehouseId, quantity },
        });
      } else if (type === 'OUTBOUND') {
        await tx.stockItem.update({
          where: { productId_warehouseId: { productId, warehouseId } },
          data: { quantity: { decrement: quantity } },
        });
      } else if (type === 'TRANSFER') {
        await tx.stockItem.update({
          where: { productId_warehouseId: { productId, warehouseId } },
          data: { quantity: { decrement: quantity } },
        });
        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId, warehouseId: targetWarehouseId! } },
          update: { quantity: { increment: quantity } },
          create: { productId, warehouseId: targetWarehouseId!, quantity },
        });
      } else if (type === 'ADJUSTMENT') {
        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId, warehouseId } },
          update: { quantity: { increment: quantity } },
          create: { productId, warehouseId, quantity },
        });
      }

      return [mv];
    });

    // Non-blocking low-stock check after commit
    checkLowStock(productId).catch(() => {});

    res.status(201).json({ data: movement });
  } catch (err) { next(err); }
}

export async function listTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const productId = req.query.productId as string | undefined;
    const type = req.query.type as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, sku: true, name: true } },
          createdBy: { select: { id: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: req.params.id },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        createdBy: { select: { id: true, email: true } },
      },
    });
    if (!movement) return res.status(404).json({ status: 404, error: 'Transaction not found' });
    res.json({ data: movement });
  } catch (err) { next(err); }
}
