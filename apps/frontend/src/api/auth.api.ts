import client from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await client.post('/auth/login', { email, password });
  return res.data.data;
}

export async function me(): Promise<AuthUser> {
  const res = await client.get('/auth/me');
  return res.data.data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}
