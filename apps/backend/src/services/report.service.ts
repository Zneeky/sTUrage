import prisma from '../utils/prisma';

export async function getCurrentStock() {
  return prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true, sku: true, name: true, unit: true, minStock: true,
      category: { select: { name: true } },
      supplier: { select: { name: true } },
      stockItems: { select: { quantity: true, warehouse: { select: { name: true } } } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getMovementByPeriod(dateFrom?: string, dateTo?: string) {
  const where: Record<string, unknown> = {};
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }
  return prisma.stockMovement.findMany({
    where,
    include: {
      product: { select: { sku: true, name: true } },
      createdBy: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true, sku: true, name: true, unit: true, minStock: true,
      category: { select: { name: true } },
      stockItems: { select: { quantity: true, warehouse: { select: { name: true } } } },
    },
  });
  return products.filter((p: typeof products[number]) => {
    const total = p.stockItems.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0);
    return total <= p.minStock;
  });
}
