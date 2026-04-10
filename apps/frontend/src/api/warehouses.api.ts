import client from './client';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
}

export async function listWarehouses(): Promise<Warehouse[]> {
  const res = await client.get('/warehouses', { params: { limit: 100 } });
  return res.data.data;
}
