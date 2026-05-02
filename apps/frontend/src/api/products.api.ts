import client from './client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  supplier?: { id: string; name: string };
  stockItems: { quantity: number; warehouse: { id: string; name: string } }[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  supplierId?: string | null;
  unit?: string;
  minStock?: number;
}

export async function listProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
}): Promise<ProductsResponse> {
  const res = await client.get('/products', { params });
  return res.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await client.get(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const res = await client.post('/products', data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
  const res = await client.put(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(`/products/${id}`);
}
