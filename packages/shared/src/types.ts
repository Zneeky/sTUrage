export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
export type MovementType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  error: string;
  details?: Record<string, string[]>;
}
