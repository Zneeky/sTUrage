import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../utils/prisma';

const ADMIN_EMAIL = 'test-admin-users@sturage.test';
const TEST_PASSWORD = 'TestPass@123';
let adminToken: string;

beforeAll(async () => {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, password, firstName: 'Admin', lastName: 'Users', role: 'ADMIN' },
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = res.body.data.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [ADMIN_EMAIL, 'new-user@sturage.test', 'target-user@sturage.test'] } },
  });
  await prisma.$disconnect();
});

// TC-004: Load user list
describe('GET /api/users', () => {
  it('TC-004: returns paginated user list for ADMIN', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('totalPages');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});

// TC-005: Create user
describe('POST /api/users', () => {
  it('TC-005: creates user as ADMIN and returns 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'new-user@sturage.test',
        password: 'NewPass@123',
        firstName: 'New',
        lastName: 'User',
        role: 'OPERATOR',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('new-user@sturage.test');
    expect(res.body.data.role).toBe('OPERATOR');
    expect(res.body.data).not.toHaveProperty('password');
  });

  // TC-006: Duplicate email validation
  it('TC-006: returns 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: ADMIN_EMAIL,
        password: 'AnotherPass@123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'VIEWER',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'incomplete@sturage.test' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid role value', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'badrole@sturage.test',
        password: 'Pass@123!',
        firstName: 'Bad',
        lastName: 'Role',
        role: 'SUPERUSER',
      });

    expect(res.status).toBe(422);
  });
});

// TC-007: Toggle user status
describe('PATCH /api/users/:id/deactivate + activate', () => {
  let targetUserId: string;

  beforeAll(async () => {
    const password = await bcrypt.hash(TEST_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        email: 'target-user@sturage.test',
        password,
        firstName: 'Target',
        lastName: 'User',
        role: 'OPERATOR',
      },
    });
    targetUserId = user.id;
  });

  it('TC-007: deactivates user — isActive becomes false', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('TC-007: activates user — isActive becomes true', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });

  it('returns 400 when trying to deactivate yourself', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const selfId = meRes.body.data.id;

    const res = await request(app)
      .patch(`/api/users/${selfId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
