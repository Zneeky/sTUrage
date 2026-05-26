import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../utils/prisma';

const ADMIN_EMAIL = 'test-admin-reports@sturage.test';
const MANAGER_EMAIL = 'test-manager-reports@sturage.test';
const VIEWER_EMAIL = 'test-viewer-reports@sturage.test';
const TEST_PASSWORD = 'TestPass@123';
let adminToken: string;
let managerToken: string;
let viewerToken: string;

beforeAll(async () => {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.createMany({
    data: [
      { email: ADMIN_EMAIL, password, firstName: 'Admin', lastName: 'Reports', role: 'ADMIN' },
      { email: MANAGER_EMAIL, password, firstName: 'Manager', lastName: 'Reports', role: 'MANAGER' },
      { email: VIEWER_EMAIL, password, firstName: 'Viewer', lastName: 'Reports', role: 'VIEWER' },
    ],
  });

  const [adminRes, managerRes, viewerRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: ADMIN_EMAIL, password: TEST_PASSWORD }),
    request(app).post('/api/auth/login').send({ email: MANAGER_EMAIL, password: TEST_PASSWORD }),
    request(app).post('/api/auth/login').send({ email: VIEWER_EMAIL, password: TEST_PASSWORD }),
  ]);
  adminToken = adminRes.body.data.token;
  managerToken = managerRes.body.data.token;
  viewerToken = viewerRes.body.data.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [ADMIN_EMAIL, MANAGER_EMAIL, VIEWER_EMAIL] } },
  });
  await prisma.$disconnect();
});

// TC-017: Load current stock report
describe('GET /api/reports/current-stock', () => {
  it('TC-017: returns 200 with data array for ADMIN', async () => {
    const res = await request(app)
      .get('/api/reports/current-stock')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('TC-017: returns 200 for MANAGER role', async () => {
    const res = await request(app)
      .get('/api/reports/current-stock')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 403 for VIEWER role', async () => {
    const res = await request(app)
      .get('/api/reports/current-stock')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/reports/current-stock');
    expect(res.status).toBe(401);
  });

  it('returns 400 for unsupported format', async () => {
    const res = await request(app)
      .get('/api/reports/current-stock')
      .query({ format: 'csv' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

// TC-017: Low stock report
describe('GET /api/reports/low-stock', () => {
  it('TC-017: returns 200 with data array for ADMIN', async () => {
    const res = await request(app)
      .get('/api/reports/low-stock')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 403 for VIEWER role', async () => {
    const res = await request(app)
      .get('/api/reports/low-stock')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});

// Movement report
describe('GET /api/reports/movement', () => {
  it('returns 200 with data array for ADMIN', async () => {
    const res = await request(app)
      .get('/api/reports/movement')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 200 with date range filter', async () => {
    const res = await request(app)
      .get('/api/reports/movement')
      .query({ dateFrom: '2025-01-01', dateTo: '2025-12-31' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
