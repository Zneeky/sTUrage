import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
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

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics', description: 'Electronic components and devices' },
  });

  const supplier = await prisma.supplier.create({
    data: {
      name: 'Default Supplier',
      contactName: 'John Doe',
      email: 'supplier@example.com',
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      location: 'Building A, Floor 1',
    },
  });

  await prisma.product.create({
    data: {
      sku: 'ELEC-001',
      name: 'Sample Product',
      description: 'A sample product for testing',
      categoryId: category.id,
      supplierId: supplier.id,
      minStock: 10,
    },
  });

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
