import client from './client';

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface SuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const res = await client.get('/suppliers');
  return res.data.data;
}

export async function listSuppliersPaginated(params: { page: number; limit: number }): Promise<SuppliersResponse> {
  const res = await client.get('/suppliers', { params });
  return res.data;
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'isActive'>): Promise<Supplier> {
  const res = await client.post('/suppliers', data);
  return res.data.data;
}

export async function updateSupplier(id: string, data: Partial<Omit<Supplier, 'id' | 'isActive'>>): Promise<Supplier> {
  const res = await client.put(`/suppliers/${id}`, data);
  return res.data.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await client.delete(`/suppliers/${id}`);
}
