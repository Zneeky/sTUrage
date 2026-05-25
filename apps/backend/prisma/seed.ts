import { PrismaClient, Role, MovementType, NotificationType, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users (all four roles) ────────────────────────────────
  const [adminPw, managerPw, operatorPw, viewerPw] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Manager@123', 10),
    bcrypt.hash('Operator@123', 10),
    bcrypt.hash('Viewer@123', 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sturage.local' },
    update: {},
    create: { email: 'admin@sturage.local', password: adminPw, firstName: 'System', lastName: 'Admin', role: Role.ADMIN },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@sturage.local' },
    update: {},
    create: { email: 'manager@sturage.local', password: managerPw, firstName: 'Elena', lastName: 'Todorova', role: Role.MANAGER },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'manager2@sturage.local' },
    update: {},
    create: { email: 'manager2@sturage.local', password: managerPw, firstName: 'Viktor', lastName: 'Stoyanov', role: Role.MANAGER },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@sturage.local' },
    update: {},
    create: { email: 'operator@sturage.local', password: operatorPw, firstName: 'Demo', lastName: 'Operator', role: Role.OPERATOR },
  });

  const operator2 = await prisma.user.upsert({
    where: { email: 'operator2@sturage.local' },
    update: {},
    create: { email: 'operator2@sturage.local', password: operatorPw, firstName: 'Petko', lastName: 'Iliev', role: Role.OPERATOR },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@sturage.local' },
    update: {},
    create: { email: 'viewer@sturage.local', password: viewerPw, firstName: 'Maria', lastName: 'Georgieva', role: Role.VIEWER },
  });

  // ── Categories ───────────────────────────────────────────
  const [electronics, furniture, officeSupplies, labEquipment, cleaning, safety] = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics', description: 'Computers, peripherals, and electronic devices' },
    }),
    prisma.category.upsert({
      where: { name: 'Furniture' },
      update: {},
      create: { name: 'Furniture', description: 'Office and warehouse furniture' },
    }),
    prisma.category.upsert({
      where: { name: 'Office Supplies' },
      update: {},
      create: { name: 'Office Supplies', description: 'Stationery, paper, and consumables' },
    }),
    prisma.category.upsert({
      where: { name: 'Laboratory Equipment' },
      update: {},
      create: { name: 'Laboratory Equipment', description: 'Scientific instruments and lab consumables' },
    }),
    prisma.category.upsert({
      where: { name: 'Cleaning Supplies' },
      update: {},
      create: { name: 'Cleaning Supplies', description: 'Janitorial and sanitation products' },
    }),
    prisma.category.upsert({
      where: { name: 'Safety Equipment' },
      update: {},
      create: { name: 'Safety Equipment', description: 'Personal protective equipment and safety gear' },
    }),
  ]);

  // ── Suppliers ────────────────────────────────────────────
  const techSupply = await prisma.supplier.upsert({
    where: { id: (await prisma.supplier.findFirst({ where: { name: 'TechSupply EOOD' } }))?.id ?? 'nonexistent' },
    update: {},
    create: {
      name: 'TechSupply EOOD',
      contactName: 'Georgi Petrov',
      email: 'georgi@techsupply.bg',
      phone: '+359 88 123 4567',
      address: 'Sofia, bul. Vitosha 45, Bulgaria',
    },
  });

  const officeWorld = await getOrCreateSupplier('OfficeWorld Ltd', {
    contactName: 'Ivanka Dimitrova',
    email: 'orders@officeworld.bg',
    phone: '+359 2 456 7890',
    address: 'Plovdiv, ul. Maritsa 12, Bulgaria',
  });

  const cleanPro = await getOrCreateSupplier('CleanPro Bulgaria', {
    contactName: 'Stefan Angelov',
    email: 'stefan@cleanpro.bg',
    phone: '+359 87 654 3210',
    address: 'Varna, ul. Primorska 8, Bulgaria',
  });

  const safeGuard = await getOrCreateSupplier('SafeGuard EOOD', {
    contactName: 'Nadya Kostadinova',
    email: 'nadya@safeguard.bg',
    phone: '+359 89 987 6543',
    address: 'Burgas, ul. Aleksandrovska 22, Bulgaria',
  });

  const labSupplier = await getOrCreateSupplier('LabTech Sciences BG', {
    contactName: 'Prof. Hristo Manchev',
    email: 'procurement@labtech.bg',
    phone: '+359 2 789 0123',
    address: 'Sofia, ul. Akad. G. Bonchev 1, Bulgaria',
  });

  // ── Warehouses ───────────────────────────────────────────
  const mainWarehouse = await getOrCreateWarehouse('Main Warehouse', 'Building A, Floor 1');
  const annexWarehouse = await getOrCreateWarehouse('Annex Warehouse', 'Building B, Ground Floor');
  const labStorage = await getOrCreateWarehouse('Lab Storage', 'Building C, Basement');
  const externalUnit = await getOrCreateWarehouse('External Unit', 'Off-Campus, Industrial Zone 4');

  // ── Products ─────────────────────────────────────────────
  // Electronics
  const laptop = await upsertProduct('ELEC-001', 'Laptop 15"', 'Business laptop, 15-inch display, Intel i7', 'pcs', 5, electronics.id, techSupply.id);
  const monitor = await upsertProduct('ELEC-002', 'Monitor 27"', '4K IPS monitor, 27-inch', 'pcs', 4, electronics.id, techSupply.id);
  const keyboard = await upsertProduct('ELEC-003', 'Mechanical Keyboard', 'Wired mechanical keyboard, TKL layout', 'pcs', 10, electronics.id, techSupply.id);
  const mouse = await upsertProduct('ELEC-004', 'Wireless Mouse', 'Ergonomic wireless optical mouse', 'pcs', 10, electronics.id, techSupply.id);
  const networkSwitch = await upsertProduct('ELEC-005', 'Network Switch 24-port', 'Managed Gigabit Ethernet switch', 'pcs', 2, electronics.id, techSupply.id);
  const projector = await upsertProduct('ELEC-006', 'Projector 4K', 'Short-throw 4K laser projector', 'pcs', 2, electronics.id, techSupply.id);

  // Furniture
  const chair = await upsertProduct('FURN-001', 'Office Chair', 'Ergonomic chair with lumbar support', 'pcs', 5, furniture.id, officeWorld.id);
  const desk = await upsertProduct('FURN-002', 'Standing Desk', 'Height-adjustable sit-stand desk', 'pcs', 3, furniture.id, officeWorld.id);
  const cabinet = await upsertProduct('FURN-003', 'Filing Cabinet', '4-drawer metal filing cabinet', 'pcs', 2, furniture.id, officeWorld.id);
  const shelf = await upsertProduct('FURN-004', 'Bookshelf', 'Heavy-duty metal shelving unit', 'pcs', 3, furniture.id, officeWorld.id);

  // Office Supplies
  const paper = await upsertProduct('OFF-001', 'Printer Paper A4', 'A4 80gsm white paper, ream of 500 sheets', 'ream', 50, officeSupplies.id, officeWorld.id);
  const pens = await upsertProduct('OFF-002', 'Ballpoint Pens (box)', 'Box of 50 blue ballpoint pens', 'box', 20, officeSupplies.id, officeWorld.id);
  const markers = await upsertProduct('OFF-003', 'Whiteboard Markers', 'Pack of 12 assorted whiteboard markers', 'pack', 15, officeSupplies.id, officeWorld.id);
  const stickyNotes = await upsertProduct('OFF-004', 'Sticky Notes', 'Pack of 100 sticky notes, 76x76mm', 'pack', 30, officeSupplies.id, officeWorld.id);

  // Lab Equipment
  const microscope = await upsertProduct('LAB-001', 'Optical Microscope', 'Binocular optical microscope, 40–1000× magnification', 'pcs', 2, labEquipment.id, labSupplier.id);
  const labGloves = await upsertProduct('LAB-002', 'Lab Gloves (box)', 'Nitrile disposable gloves, box of 100', 'box', 20, labEquipment.id, labSupplier.id);
  const safetyGoggles = await upsertProduct('LAB-003', 'Safety Goggles', 'Anti-fog chemical splash goggles', 'pcs', 10, labEquipment.id, labSupplier.id);

  // Cleaning Supplies
  const cleaningSolution = await upsertProduct('CLN-001', 'Multi-Surface Cleaner (5L)', 'Antibacterial multi-surface cleaning solution', 'bottle', 30, cleaning.id, cleanPro.id);
  const mopSet = await upsertProduct('CLN-002', 'Mop & Bucket Set', 'Industrial mop with wringer bucket', 'set', 5, cleaning.id, cleanPro.id);

  // Safety Equipment
  const hardHat = await upsertProduct('SAF-001', 'Hard Hat', 'HDPE safety helmet, EN397 certified', 'pcs', 10, safety.id, safeGuard.id);
  const safetyVest = await upsertProduct('SAF-002', 'High-Vis Safety Vest', 'Class 2 high-visibility vest', 'pcs', 15, safety.id, safeGuard.id);
  const fireExtinguisher = await upsertProduct('SAF-003', 'Fire Extinguisher 6kg', 'ABC dry powder fire extinguisher', 'pcs', 4, safety.id, safeGuard.id);

  // ── StockItems ───────────────────────────────────────────
  // Normal stock levels
  await upsertStockItem(laptop.id, mainWarehouse.id, 22);
  await upsertStockItem(laptop.id, annexWarehouse.id, 8);
  await upsertStockItem(monitor.id, mainWarehouse.id, 15);
  await upsertStockItem(monitor.id, annexWarehouse.id, 6);
  await upsertStockItem(keyboard.id, mainWarehouse.id, 30);
  await upsertStockItem(mouse.id, mainWarehouse.id, 28);
  await upsertStockItem(networkSwitch.id, mainWarehouse.id, 4);
  await upsertStockItem(projector.id, mainWarehouse.id, 3);

  await upsertStockItem(chair.id, mainWarehouse.id, 12);
  await upsertStockItem(chair.id, annexWarehouse.id, 5);
  await upsertStockItem(desk.id, mainWarehouse.id, 7);
  await upsertStockItem(cabinet.id, mainWarehouse.id, 4);
  await upsertStockItem(shelf.id, mainWarehouse.id, 8);
  await upsertStockItem(shelf.id, externalUnit.id, 10);

  await upsertStockItem(paper.id, mainWarehouse.id, 120);
  await upsertStockItem(paper.id, annexWarehouse.id, 60);
  await upsertStockItem(pens.id, mainWarehouse.id, 35);
  await upsertStockItem(markers.id, mainWarehouse.id, 22);
  await upsertStockItem(stickyNotes.id, mainWarehouse.id, 50);

  await upsertStockItem(microscope.id, labStorage.id, 3);
  await upsertStockItem(labGloves.id, labStorage.id, 40);
  await upsertStockItem(safetyGoggles.id, labStorage.id, 18);

  // Low-stock items (quantity < minStock → will trigger notifications)
  await upsertStockItem(cleaningSolution.id, mainWarehouse.id, 12);  // minStock=30 → LOW_STOCK
  await upsertStockItem(mopSet.id, mainWarehouse.id, 2);             // minStock=5  → LOW_STOCK

  // Out-of-stock items
  await upsertStockItem(hardHat.id, mainWarehouse.id, 0);            // minStock=10 → OUT_OF_STOCK
  await upsertStockItem(safetyVest.id, mainWarehouse.id, 3);         // minStock=15 → LOW_STOCK
  await upsertStockItem(fireExtinguisher.id, mainWarehouse.id, 1);   // minStock=4  → LOW_STOCK

  // ── Stock Movements (history) ────────────────────────────
  const movements: Prisma.StockMovementCreateManyInput[] = [
    // Initial inbound for electronics
    { type: MovementType.INBOUND, quantity: 25, productId: laptop.id, targetWarehouseId: mainWarehouse.id, createdById: admin.id, note: 'Initial stock' },
    { type: MovementType.INBOUND, quantity: 10, productId: laptop.id, targetWarehouseId: annexWarehouse.id, createdById: manager.id, note: 'Initial stock — annex' },
    { type: MovementType.INBOUND, quantity: 20, productId: monitor.id, targetWarehouseId: mainWarehouse.id, createdById: admin.id, note: 'Initial stock' },
    { type: MovementType.INBOUND, quantity: 8, productId: monitor.id, targetWarehouseId: annexWarehouse.id, createdById: manager.id, note: 'Initial stock — annex' },
    { type: MovementType.INBOUND, quantity: 40, productId: keyboard.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Bulk keyboard order' },
    { type: MovementType.INBOUND, quantity: 40, productId: mouse.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Bulk mouse order' },
    { type: MovementType.INBOUND, quantity: 5, productId: networkSwitch.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Network upgrade batch' },
    { type: MovementType.INBOUND, quantity: 4, productId: projector.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Conference room equipment' },

    // Outbound electronics
    { type: MovementType.OUTBOUND, quantity: 3, productId: laptop.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to CS department' },
    { type: MovementType.OUTBOUND, quantity: 2, productId: laptop.id, sourceWarehouseId: annexWarehouse.id, createdById: operator2.id, note: 'Issued to admin office' },
    { type: MovementType.OUTBOUND, quantity: 5, productId: monitor.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to labs' },
    { type: MovementType.OUTBOUND, quantity: 2, productId: monitor.id, sourceWarehouseId: annexWarehouse.id, createdById: operator2.id, note: 'Issued to rector office' },
    { type: MovementType.OUTBOUND, quantity: 10, productId: keyboard.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Computer lab refresh' },
    { type: MovementType.OUTBOUND, quantity: 12, productId: mouse.id, sourceWarehouseId: mainWarehouse.id, createdById: operator2.id, note: 'Computer lab refresh' },
    { type: MovementType.OUTBOUND, quantity: 1, productId: networkSwitch.id, sourceWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Installed in server room' },

    // Transfer between warehouses
    { type: MovementType.TRANSFER, quantity: 5, productId: chair.id, sourceWarehouseId: mainWarehouse.id, targetWarehouseId: annexWarehouse.id, createdById: manager.id, note: 'Rebalancing stock between buildings' },
    { type: MovementType.TRANSFER, quantity: 20, productId: paper.id, sourceWarehouseId: mainWarehouse.id, targetWarehouseId: annexWarehouse.id, createdById: operator.id, note: 'Paper transferred for secretariat' },
    { type: MovementType.TRANSFER, quantity: 5, productId: shelf.id, sourceWarehouseId: mainWarehouse.id, targetWarehouseId: externalUnit.id, createdById: manager2.id, note: 'External unit setup' },

    // Furniture inbound
    { type: MovementType.INBOUND, quantity: 20, productId: chair.id, targetWarehouseId: mainWarehouse.id, createdById: admin.id, note: 'Initial stock' },
    { type: MovementType.INBOUND, quantity: 10, productId: desk.id, targetWarehouseId: mainWarehouse.id, createdById: admin.id, note: 'Standing desk pilot program' },
    { type: MovementType.INBOUND, quantity: 6, productId: cabinet.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Archive room upgrade' },
    { type: MovementType.INBOUND, quantity: 15, productId: shelf.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Warehouse shelving expansion' },
    { type: MovementType.OUTBOUND, quantity: 3, productId: desk.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to faculty offices' },
    { type: MovementType.OUTBOUND, quantity: 2, productId: cabinet.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to admin wing' },

    // Office supplies
    { type: MovementType.INBOUND, quantity: 200, productId: paper.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Quarterly paper order' },
    { type: MovementType.INBOUND, quantity: 50, productId: pens.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Annual stationery order' },
    { type: MovementType.INBOUND, quantity: 30, productId: markers.id, targetWarehouseId: mainWarehouse.id, createdById: operator2.id, note: 'Whiteboard supply restock' },
    { type: MovementType.INBOUND, quantity: 80, productId: stickyNotes.id, targetWarehouseId: mainWarehouse.id, createdById: operator2.id, note: 'Annual stationery order' },
    { type: MovementType.OUTBOUND, quantity: 60, productId: paper.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Print room monthly allocation' },
    { type: MovementType.OUTBOUND, quantity: 15, productId: pens.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Department distribution' },
    { type: MovementType.OUTBOUND, quantity: 8, productId: markers.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to lecture halls' },
    { type: MovementType.OUTBOUND, quantity: 30, productId: stickyNotes.id, sourceWarehouseId: mainWarehouse.id, createdById: operator2.id, note: 'Department distribution' },

    // Lab equipment
    { type: MovementType.INBOUND, quantity: 5, productId: microscope.id, targetWarehouseId: labStorage.id, createdById: manager2.id, note: 'Lab equipment procurement' },
    { type: MovementType.INBOUND, quantity: 60, productId: labGloves.id, targetWarehouseId: labStorage.id, createdById: operator2.id, note: 'Lab consumables restock' },
    { type: MovementType.INBOUND, quantity: 20, productId: safetyGoggles.id, targetWarehouseId: labStorage.id, createdById: operator2.id, note: 'PPE for lab students' },
    { type: MovementType.OUTBOUND, quantity: 2, productId: microscope.id, sourceWarehouseId: labStorage.id, createdById: manager2.id, note: 'Issued to biology lab' },
    { type: MovementType.OUTBOUND, quantity: 20, productId: labGloves.id, sourceWarehouseId: labStorage.id, createdById: operator2.id, note: 'Lab semester allocation' },
    { type: MovementType.OUTBOUND, quantity: 2, productId: safetyGoggles.id, sourceWarehouseId: labStorage.id, createdById: operator2.id, note: 'Issued to chemistry lab' },

    // Cleaning supplies (now low stock)
    { type: MovementType.INBOUND, quantity: 50, productId: cleaningSolution.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Cleaning supplies order' },
    { type: MovementType.INBOUND, quantity: 8, productId: mopSet.id, targetWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Janitorial restock' },
    { type: MovementType.OUTBOUND, quantity: 38, productId: cleaningSolution.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Distributed to cleaning staff' },
    { type: MovementType.OUTBOUND, quantity: 6, productId: mopSet.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to facilities team' },

    // Safety equipment (now low/out of stock)
    { type: MovementType.INBOUND, quantity: 20, productId: hardHat.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Safety compliance order' },
    { type: MovementType.INBOUND, quantity: 25, productId: safetyVest.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Safety compliance order' },
    { type: MovementType.INBOUND, quantity: 6, productId: fireExtinguisher.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Annual fire safety restock' },
    { type: MovementType.OUTBOUND, quantity: 20, productId: hardHat.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Construction site deployment' },
    { type: MovementType.OUTBOUND, quantity: 22, productId: safetyVest.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Issued to maintenance crews' },
    { type: MovementType.OUTBOUND, quantity: 5, productId: fireExtinguisher.id, sourceWarehouseId: mainWarehouse.id, createdById: operator.id, note: 'Installed across campus buildings' },

    // Adjustments
    { type: MovementType.ADJUSTMENT, quantity: 2, productId: keyboard.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Inventory count correction — 2 units found in storage' },
    { type: MovementType.ADJUSTMENT, quantity: -3, productId: pens.id, targetWarehouseId: mainWarehouse.id, createdById: manager.id, note: 'Shrinkage adjustment after quarterly audit' },
    { type: MovementType.ADJUSTMENT, quantity: -1, productId: monitor.id, targetWarehouseId: mainWarehouse.id, createdById: admin.id, note: 'Damaged unit written off' },
  ];

  await prisma.stockMovement.createMany({ data: movements });

  // ── Notifications ────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        type: NotificationType.OUT_OF_STOCK,
        message: 'Hard Hat is out of stock in Main Warehouse (0 pcs). Minimum required: 10.',
        productId: hardHat.id,
        isRead: false,
      },
      {
        type: NotificationType.LOW_STOCK,
        message: 'Multi-Surface Cleaner (5L) is below minimum stock in Main Warehouse (12 bottles). Minimum required: 30.',
        productId: cleaningSolution.id,
        isRead: false,
      },
      {
        type: NotificationType.LOW_STOCK,
        message: 'Mop & Bucket Set is below minimum stock in Main Warehouse (2 sets). Minimum required: 5.',
        productId: mopSet.id,
        isRead: false,
      },
      {
        type: NotificationType.LOW_STOCK,
        message: 'High-Vis Safety Vest is below minimum stock in Main Warehouse (3 pcs). Minimum required: 15.',
        productId: safetyVest.id,
        isRead: false,
      },
      {
        type: NotificationType.LOW_STOCK,
        message: 'Fire Extinguisher 6kg is below minimum stock in Main Warehouse (1 pcs). Minimum required: 4.',
        productId: fireExtinguisher.id,
        isRead: true,
      },
    ],
  });

  // ── Audit Logs ───────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { action: 'POST /api/products', entity: 'Product', entityId: laptop.id, userId: admin.id, payload: { sku: 'ELEC-001', name: 'Laptop 15"' } },
      { action: 'POST /api/products', entity: 'Product', entityId: monitor.id, userId: admin.id, payload: { sku: 'ELEC-002', name: 'Monitor 27"' } },
      { action: 'POST /api/warehouses', entity: 'Warehouse', entityId: labStorage.id, userId: admin.id, payload: { name: 'Lab Storage' } },
      { action: 'POST /api/warehouses', entity: 'Warehouse', entityId: externalUnit.id, userId: admin.id, payload: { name: 'External Unit' } },
      { action: 'POST /api/suppliers', entity: 'Supplier', entityId: officeWorld.id, userId: admin.id, payload: { name: 'OfficeWorld Ltd' } },
      { action: 'POST /api/suppliers', entity: 'Supplier', entityId: cleanPro.id, userId: admin.id, payload: { name: 'CleanPro Bulgaria' } },
      { action: 'POST /api/stock-movements', entity: 'StockMovement', userId: manager.id, payload: { type: 'INBOUND', productId: laptop.id, quantity: 25 } },
      { action: 'POST /api/stock-movements', entity: 'StockMovement', userId: operator.id, payload: { type: 'OUTBOUND', productId: laptop.id, quantity: 3 } },
      { action: 'POST /api/stock-movements', entity: 'StockMovement', userId: manager.id, payload: { type: 'TRANSFER', productId: chair.id, quantity: 5 } },
      { action: 'PATCH /api/products/:id', entity: 'Product', entityId: keyboard.id, userId: admin.id, payload: { minStock: 10 } },
      { action: 'PATCH /api/users/:id', entity: 'User', entityId: operator2.id, userId: admin.id, payload: { role: 'OPERATOR' } },
      { action: 'DELETE /api/stock-movements/:id', entity: 'StockMovement', userId: admin.id, payload: { reason: 'Data entry error' } },
    ],
  });

  console.log('\nSeed complete.\n');
  console.log('── Users ─────────────────────────────────────────────');
  console.log('  admin@sturage.local     / Admin@123      [ADMIN]');
  console.log('  manager@sturage.local   / Manager@123    [MANAGER]');
  console.log('  manager2@sturage.local  / Manager@123    [MANAGER]');
  console.log('  operator@sturage.local  / Operator@123   [OPERATOR]');
  console.log('  operator2@sturage.local / Operator@123   [OPERATOR]');
  console.log('  viewer@sturage.local    / Viewer@123     [VIEWER]');
  console.log('──────────────────────────────────────────────────────');
  console.log('  6 categories | 5 suppliers | 4 warehouses');
  console.log('  22 products  | 50+ movements | 5 notifications | 12 audit logs');
}

// ── Helpers ──────────────────────────────────────────────

async function getOrCreateSupplier(name: string, data: { contactName?: string; email?: string; phone?: string; address?: string }) {
  const existing = await prisma.supplier.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.supplier.create({ data: { name, ...data } });
}

async function getOrCreateWarehouse(name: string, location: string) {
  const existing = await prisma.warehouse.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.warehouse.create({ data: { name, location } });
}

async function upsertProduct(sku: string, name: string, description: string, unit: string, minStock: number, categoryId: string, supplierId?: string) {
  return prisma.product.upsert({
    where: { sku },
    update: {},
    create: { sku, name, description, unit, minStock, categoryId, supplierId },
  });
}

async function upsertStockItem(productId: string, warehouseId: string, quantity: number) {
  return prisma.stockItem.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    update: { quantity },
    create: { productId, warehouseId, quantity },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
