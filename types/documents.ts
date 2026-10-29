export type ValidationStatus =
  | "PENDING_VALIDATION"
  | "APPROVED"
  | "REJECTED";

export type EmbeddingStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  content_type: string;
  content_hash: string;
  uploader_id: string;
  validation_status: ValidationStatus;
  validation_failure_reason: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentEmbedding {
  id: string;
  document_id: string;
  embedding: number[];
  embedding_model: string;
  embedding_status: EmbeddingStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListItem
  extends Omit<Document, "storage_path" | "content_hash"> {
  uploader_email?: string;
  similarity?: number;
  matched_snippet?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DocumentListResponse {
  data: DocumentListItem[];
  pagination: PaginationMeta;
}
