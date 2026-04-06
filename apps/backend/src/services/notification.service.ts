import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendLowStockEmail } from './email.service';

export async function checkLowStock(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { stockItems: { select: { quantity: true } } },
  });
  if (!product) return;

  const totalStock = product.stockItems.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0);
  if (totalStock > product.minStock) return;

  // STUR-63: skip if an unread notification already exists for this product
  const existing = await prisma.notification.findFirst({
    where: { productId, isRead: false },
  });
  if (existing) return;

  await prisma.notification.create({
    data: {
      productId,
      message: `Low stock: ${product.name} has ${totalStock} unit(s) remaining (threshold: ${product.minStock})`,
    },
  });

  sendLowStockEmail(product.name, totalStock, product.minStock)
    .catch((err) => logger.error('Low stock email failed', { err, productId }));
}
