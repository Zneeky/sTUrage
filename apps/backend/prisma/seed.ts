import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const operatorPassword = await bcrypt.hash('Operator@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sturage.local' },
    update: {},
    create: {
      email: 'admin@sturage.local',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@sturage.local' },
    update: {},
    create: {
      email: 'operator@sturage.local',
      password: operatorPassword,
      firstName: 'Demo',
      lastName: 'Operator',
      role: Role.OPERATOR,
    },
  });

  // ── Categories ───────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics', description: 'Electronic components and devices' },
  });

  const furniture = await prisma.category.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: { name: 'Furniture', description: 'Office and warehouse furniture' },
  });

  // ── Supplier ─────────────────────────────────────────────
  const supplier = await prisma.supplier.create({
    data: {
      name: 'TechSupply EOOD',
      contactName: 'Georgi Petrov',
      email: 'georgi@techsupply.bg',
      phone: '+359 88 123 4567',
      address: 'Sofia, Bulgaria',
    },
  });

  // ── Warehouses ───────────────────────────────────────────
  const mainWarehouse = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', location: 'Building A, Floor 1' },
  });

  const annexWarehouse = await prisma.warehouse.create({
    data: { name: 'Annex Warehouse', location: 'Building B, Ground Floor' },
  });

  // ── Products ─────────────────────────────────────────────
  const laptop = await prisma.product.create({
    data: {
      sku: 'ELEC-001',
      name: 'Laptop 15"',
      description: 'Business laptop, 15 inch display',
      unit: 'pcs',
      minStock: 5,
      categoryId: electronics.id,
      supplierId: supplier.id,
    },
  });

  const chair = await prisma.product.create({
    data: {
      sku: 'FURN-001',
      name: 'Office Chair',
      description: 'Ergonomic office chair with lumbar support',
      unit: 'pcs',
      minStock: 2,
      categoryId: furniture.id,
    },
  });

  // ── StockItems (initial quantities) ──────────────────────
  await prisma.stockItem.createMany({
    data: [
      { productId: laptop.id, warehouseId: mainWarehouse.id, quantity: 20 },
      { productId: laptop.id, warehouseId: annexWarehouse.id, quantity: 5 },
      { productId: chair.id, warehouseId: mainWarehouse.id, quantity: 10 },
    ],
  });

  // ── Initial stock movements (matching the StockItems above) ──
  await prisma.stockMovement.createMany({
    data: [
      {
        type: 'INBOUND',
        quantity: 20,
        productId: laptop.id,
        targetWarehouseId: mainWarehouse.id,
        createdById: admin.id,
        note: 'Initial stock — seed data',
      },
      {
        type: 'INBOUND',
        quantity: 5,
        productId: laptop.id,
        targetWarehouseId: annexWarehouse.id,
        createdById: admin.id,
        note: 'Initial stock — seed data',
      },
      {
        type: 'INBOUND',
        quantity: 10,
        productId: chair.id,
        targetWarehouseId: mainWarehouse.id,
        createdById: admin.id,
        note: 'Initial stock — seed data',
      },
    ],
  });

  console.log('Seed complete.');
  console.log('  admin@sturage.local   / Admin@123');
  console.log('  operator@sturage.local / Operator@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
