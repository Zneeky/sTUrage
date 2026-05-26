import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../utils/prisma';

const ADMIN_EMAIL = 'test-admin-movements@sturage.test';
const TEST_PASSWORD = 'TestPass@123';
let adminToken: string;
let productId: string;
let warehouseId: string;
let warehouseId2: string;
let categoryId: string;

beforeAll(async () => {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, password, firstName: 'Admin', lastName: 'Movements', role: 'ADMIN' },
  });

  const category = await prisma.category.create({ data: { name: 'Test Cat Movements' } });
  categoryId = category.id;

  const product = await prisma.product.create({
    data: { sku: 'MV-TEST-001', name: 'Movement Test Product', categoryId },
  });
  productId = product.id;

  const [w1, w2] = await Promise.all([
    prisma.warehouse.create({ data: { name: 'Movements WH1', location: 'Loc A' } }),
    prisma.warehouse.create({ data: { name: 'Movements WH2', location: 'Loc B' } }),
  ]);
  warehouseId = w1.id;
  warehouseId2 = w2.id;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = loginRes.body.data.token;
});

afterAll(async () => {
  await prisma.stockMovement.deleteMany({ where: { productId } });
  await prisma.stockItem.deleteMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });
  await prisma.warehouse.deleteMany({ where: { id: { in: [warehouseId, warehouseId2] } } });
  await prisma.category.delete({ where: { id: categoryId } });
  await prisma.user.deleteMany({ where: { email: ADMIN_EMAIL } });
  await prisma.$disconnect();
});

// TC-013: Create stock movement (INBOUND)
describe('POST /api/stock-movements', () => {
  it('TC-013: creates INBOUND movement and returns 201', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId, warehouseId, type: 'INBOUND', quantity: 50, note: 'Initial stock' });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('INBOUND');
    expect(res.body.data.quantity).toBe(50);
  });

  it('creates ADJUSTMENT movement and returns 201', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId, warehouseId, type: 'ADJUSTMENT', quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('ADJUSTMENT');
  });

  // TC-015: TRANSFER with same source and target warehouse
  it('TC-015: returns 422 when TRANSFER source and target warehouse are the same', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId, warehouseId, type: 'TRANSFER', quantity: 5, targetWarehouseId: warehouseId });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/different/i);
  });

  it('returns 422 when TRANSFER has no targetWarehouseId', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId, warehouseId, type: 'TRANSFER', quantity: 5 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'INBOUND', quantity: 10 });

    expect(res.status).toBe(422);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/stock-movements')
      .send({ productId, warehouseId, type: 'INBOUND', quantity: 5 });

    expect(res.status).toBe(401);
  });
});

// TC-016: Pagination of stock movement list
describe('GET /api/stock-movements', () => {
  it('TC-016: returns paginated response with all pagination fields', async () => {
    const res = await request(app)
      .get('/api/stock-movements')
      .query({ page: 1, limit: 2 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 2);
    expect(res.body).toHaveProperty('totalPages');
    expect(typeof res.body.totalPages).toBe('number');
  });

  it('TC-016: respects limit - returns at most limit items', async () => {
    const res = await request(app)
      .get('/api/stock-movements')
      .query({ page: 1, limit: 1 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/stock-movements');
    expect(res.status).toBe(401);
  });
});
