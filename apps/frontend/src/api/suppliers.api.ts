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

export async function listSuppliers(): Promise<Supplier[]> {
  const res = await client.get('/suppliers');
  return res.data.data;
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'isActive'>): Promise<Supplier> {
  const res = await client.post('/suppliers', data);
  return res.data.data;
}

export async function updateSupplier(id: string, data: Partial<Omit<Supplier, 'id' | 'isActive'>>): Promise<Supplier> {
  const res = await client.put(`/suppliers/${id}`, data);
  return res.data.data;
}
