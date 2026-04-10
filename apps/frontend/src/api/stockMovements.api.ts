import client from './client';

export interface StockMovement {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  note?: string;
  createdAt: string;
  product: { id: string; sku: string; name: string };
  createdBy: { id: string; email: string };
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
}

export interface MovementsResponse {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMovementDto {
  productId: string;
  warehouseId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  note?: string;
  targetWarehouseId?: string;
}

export async function listMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<MovementsResponse> {
  const res = await client.get('/stock-movements', { params });
  return res.data;
}

export async function getMovement(id: string): Promise<StockMovement> {
  const res = await client.get(`/stock-movements/${id}`);
  return res.data.data;
}

export async function createMovement(data: CreateMovementDto): Promise<StockMovement> {
  const res = await client.post('/stock-movements', data);
  return res.data.data;
}
