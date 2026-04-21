import client from './client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: unknown;
  createdAt: string;
  user: { email: string };
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: User['role'];
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: User['role'];
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listUsers(params?: { page?: number; limit?: number; search?: string }): Promise<UsersResponse> {
  const res = await client.get('/users', { params });
  return res.data;
}

export async function createUser(data: CreateUserDto): Promise<User> {
  const res = await client.post('/users', data);
  return res.data.data;
}

export async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const res = await client.put(`/users/${id}`, data);
  return res.data.data;
}

export async function deactivateUser(id: string): Promise<User> {
  const res = await client.patch(`/users/${id}/deactivate`);
  return res.data.data;
}

export async function listAuditLog(params?: { page?: number; limit?: number }): Promise<{ data: AuditEntry[]; total: number }> {
  const res = await client.get('/users/audit-log', { params });
  return { data: res.data.data, total: res.data.total };
}
