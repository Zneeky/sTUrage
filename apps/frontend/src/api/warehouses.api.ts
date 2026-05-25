import client from './client';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listWarehouses(): Promise<Warehouse[]> {
  const res = await client.get('/warehouses', { params: { limit: 100 } });
  return res.data.data;
}

export async function listWarehousesPaginated(params: { page: number; limit: number; search?: string }): Promise<WarehousesResponse> {
  const res = await client.get('/warehouses', { params });
  return res.data;
}

export async function getWarehouse(id: string): Promise<Warehouse> {
  const res = await client.get(`/warehouses/${id}`);
  return res.data.data;
}

export async function createWarehouse(data: { name: string; location: string; description?: string }): Promise<Warehouse> {
  const res = await client.post('/warehouses', data);
  return res.data.data;
}

export async function updateWarehouse(id: string, data: { name?: string; location?: string; description?: string }): Promise<Warehouse> {
  const res = await client.put(`/warehouses/${id}`, data);
  return res.data.data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await client.delete(`/warehouses/${id}`);
}
