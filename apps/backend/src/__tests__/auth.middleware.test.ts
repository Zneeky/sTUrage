/// <reference types="jest" />
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type { Response, NextFunction } from 'express';

jest.mock('../utils/tokenBlacklist', () => ({
  isBlacklisted: jest.fn().mockReturnValue(false),
}));

import * as blacklistModule from '../utils/tokenBlacklist';

const SECRET = 'unit_test_secret';

beforeAll(() => { process.env.JWT_SECRET = SECRET; });
afterAll(() => { delete process.env.JWT_SECRET; });

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext(): NextFunction {
  return jest.fn();
}

describe('authenticate', () => {
  it('returns 401 when Authorization header is absent', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is blacklisted', () => {
    (blacklistModule.isBlacklisted as jest.Mock).mockReturnValueOnce(true);
    const token = jwt.sign({ id: 'u1', email: 'a@b.com', role: 'VIEWER' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    authenticate(req, mockRes(), mockNext());
    expect(blacklistModule.isBlacklisted).toHaveBeenCalledWith(token);
  });

  it('returns 401 for a tampered / invalid token', () => {
    const req = { headers: { authorization: 'Bearer this.is.notvalid' } } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and attaches user payload for a valid token', () => {
    const payload = { id: 'u1', email: 'test@sturage.com', role: 'ADMIN' };
    const token = jwt.sign(payload, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(payload);
  });
});

describe('authorize', () => {
  it('returns 403 when req.user is not set', () => {
    const req = {} as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authorize('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is not in the allowed list', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: 'VIEWER' } } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authorize('ADMIN', 'MANAGER')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user role is in the allowed list', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: 'MANAGER' } } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authorize('ADMIN', 'MANAGER')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next when the only allowed role matches exactly', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: 'OPERATOR' } } as AuthRequest;
    const res = mockRes();
    const next = mockNext();
    authorize('OPERATOR')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
