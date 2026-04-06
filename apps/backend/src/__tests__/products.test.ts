import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../utils/prisma';

const ADMIN_EMAIL = 'test-admin-products@sturage.test';
const VIEWER_EMAIL = 'test-viewer-products@sturage.test';
const TEST_PASSWORD = 'TestPass@123';

let adminToken: string;
let viewerToken: string;
let categoryId: string;

beforeAll(async () => {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.createMany({
    data: [
      { email: ADMIN_EMAIL, password, firstName: 'Admin', lastName: 'Test', role: 'ADMIN' },
      { email: VIEWER_EMAIL, password, firstName: 'Viewer', lastName: 'Test', role: 'VIEWER' },
    ],
  });

  const category = await prisma.category.create({ data: { name: 'Test Category Products' } });
  categoryId = category.id;

  const [adminRes, viewerRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: ADMIN_EMAIL, password: TEST_PASSWORD }),
    request(app).post('/api/auth/login').send({ email: VIEWER_EMAIL, password: TEST_PASSWORD }),
  ]);
  adminToken = adminRes.body.data.token;
  viewerToken = viewerRes.body.data.token;
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { sku: { startsWith: 'TEST-' } } });
  await prisma.category.deleteMany({ where: { name: 'Test Category Products' } });
  await prisma.user.deleteMany({ where: { email: { in: [ADMIN_EMAIL, VIEWER_EMAIL] } } });
  await prisma.$disconnect();
});

describe('GET /api/products', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('returns 200 with paginated list when authenticated', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('viewer can list products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
  });
});

describe('POST /api/products', () => {
  it('returns 403 for VIEWER role', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ sku: 'TEST-001', name: 'Test Product', categoryId });

    expect(res.status).toBe(403);
  });

  it('returns 201 and creates product as ADMIN', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sku: 'TEST-001', name: 'Test Product', categoryId });

    expect(res.status).toBe(201);
    expect(res.body.data.sku).toBe('TEST-001');
    expect(res.body.data.name).toBe('Test Product');
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'No SKU Product' });

    expect(res.status).toBe(422);
  });

  it('returns 409 for duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sku: 'TEST-001', name: 'Duplicate SKU', categoryId });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/warehouses', () => {
  it('returns 200 with paginated list when authenticated', async () => {
    const res = await request(app)
      .get('/api/warehouses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/warehouses');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/warehouses', () => {
  it('returns 201 and creates warehouse as ADMIN', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Warehouse', location: 'Building Z' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Warehouse');

    // cleanup
    await prisma.warehouse.delete({ where: { id: res.body.data.id } });
  });

  it('returns 403 for VIEWER role', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Unauthorized Warehouse' });

    expect(res.status).toBe(403);
  });
});
