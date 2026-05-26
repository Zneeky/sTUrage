import client from './client';

export interface StockPage {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function currentStockReport(format: 'json', page?: number, limit?: number): Promise<StockPage>;
export async function currentStockReport(format: 'pdf' | 'excel'): Promise<Blob>;
export async function currentStockReport(format: string, page = 1, limit = 20): Promise<StockPage | Blob> {
  if (format === 'json') {
    const res = await client.get('/reports/current-stock', { params: { format, page, limit } });
    return res.data as StockPage;
  }
  const res = await client.get('/reports/current-stock', { params: { format }, responseType: 'blob' });
  return res.data as Blob;
}

export async function movementReport(params: {
  format: 'json' | 'pdf' | 'excel';
  dateFrom?: string;
  dateTo?: string;
}) {
  if (params.format === 'json') {
    const res = await client.get('/reports/movement', { params });
    return res.data.data as unknown[];
  }
  const res = await client.get('/reports/movement', { params, responseType: 'blob' });
  return res.data as Blob;
}

export async function lowStockReport(format: 'json' | 'pdf' | 'excel') {
  if (format === 'json') {
    const res = await client.get('/reports/low-stock', { params: { format } });
    return res.data.data as unknown[];
  }
  const res = await client.get('/reports/low-stock', { params: { format }, responseType: 'blob' });
  return res.data as Blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
