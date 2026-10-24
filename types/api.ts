export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Search params for document listing
export interface DocumentSearchParams {
  q?: string;
  subject?: string;
  sort?: "created_at" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  semantic?: boolean;
}