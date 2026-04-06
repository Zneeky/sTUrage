import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../utils/prisma';

const TEST_EMAIL = 'test-auth@sturage.test';
const TEST_PASSWORD = 'TestPass@123';

beforeAll(async () => {
  const password = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.create({
    data: { email: TEST_EMAIL, password, firstName: 'Test', lastName: 'User', role: 'ADMIN' },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('returns 200 and token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 with unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@sturage.test', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });

  it('returns 422 with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: TEST_PASSWORD });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/auth/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    token = res.body.data.token;
  });

  it('returns 200 with user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and blacklists token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(401);
  });
});
