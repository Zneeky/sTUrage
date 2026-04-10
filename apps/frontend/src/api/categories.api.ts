import client from './client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listCategories(): Promise<Category[]> {
  const res = await client.get('/categories');
  return res.data.data;
}

export async function getCategory(id: string): Promise<Category> {
  const res = await client.get(`/categories/${id}`);
  return res.data.data;
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  const res = await client.post('/categories', data);
  return res.data.data;
}

export async function updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
  const res = await client.put(`/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await client.delete(`/categories/${id}`);
}
