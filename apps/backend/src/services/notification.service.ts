import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendLowStockEmail } from './email.service';
import { broadcast } from './sseClients';

// Fired after every stock movement. Decides whether the product is now
// out of stock (qty = 0) or low (0 < qty <= minStock) and writes one
// notification of the appropriate type, deduped against existing unread
// notifications of the same type for the same product.
export async function checkLowStock(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { stockItems: { select: { quantity: true } } },
  });
  if (!product) return;

  const totalStock = product.stockItems.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0);
  if (totalStock > product.minStock) return;

  const type: 'OUT_OF_STOCK' | 'LOW_STOCK' = totalStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK';
  const message = totalStock === 0
    ? `Out of stock: ${product.name} has 0 units remaining`
    : `Low stock: ${product.name} has ${totalStock} unit(s) remaining (threshold: ${product.minStock})`;

  // Dedup against unread notification of the *same type* for this product.
  // If product was LOW_STOCK and is now OUT_OF_STOCK, this still fires (different type).
  const existing = await prisma.notification.findFirst({
    where: { productId, type, isRead: false },
  });
  if (existing) return;

  const notification = await prisma.notification.create({ data: { productId, type, message } });

  broadcast('notification', notification);

  sendLowStockEmail(product.name, totalStock, product.minStock)
    .catch((err) => logger.error('Low stock email failed', { err, productId }));
}
