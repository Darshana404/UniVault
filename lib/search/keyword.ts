import { createServiceClient } from "@/lib/supabase/server";
import type { DocumentListItem, PaginationMeta } from "@/types/documents";
import { VALID_SUBJECTS } from "../pdf/taxonomy";

export interface KeywordSearchOptions {
  q?: string;
  subject?: string;
  sort?: "created_at" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface KeywordSearchResult {
  data: DocumentListItem[];
  pagination: PaginationMeta;
}

// Sanitize user search input to prevent PostgREST grammar injection
function sanitizeSearchTerm(term: string): string {
  // Strip characters that break PostgREST or filter syntax: commas, parentheses, wildcards, backslashes
  return term.replace(/[,()%\\]/g, " ").replace(/\s+/g, " ").trim();
}

export async function keywordSearch(
  options: KeywordSearchOptions
): Promise<KeywordSearchResult> {
  const supabase = createServiceClient();

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const offset = (page - 1) * limit;
  const sort = options.sort ?? "created_at";
  const order = options.order ?? "desc";

  // Base query — only approved documents
  let query = supabase
    .from("documents")
    .select(
      `
      id,
      title,
      description,
      subject,
      original_filename,
      file_size,
      content_type,
      uploader_id,
      validation_status,
      validation_failure_reason,
      validated_at,
      created_at,
      updated_at,
      users!uploader_id(email)
      `,
      { count: "exact" }
    )
    .eq("validation_status", "APPROVED");

  // Full-text search on title and description with sanitized term
  if (options.q && options.q.trim()) {
    const searchTerm = sanitizeSearchTerm(options.q);
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }
  }

  // Subject filter
  if (options.subject && options.subject.trim()) {
    query = query.eq("subject", options.subject.trim());
  }

  // Sorting
  query = query.order(sort, { ascending: order === "asc" });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Search query failed: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Shape the response — flatten joined user email
  const documents: DocumentListItem[] = (data ?? []).map((doc) => {
    const { users, ...rest } = doc as typeof doc & {
      users: { email: string } | null;
    };
    return {
      ...rest,
      uploader_email: users?.email,
    } as DocumentListItem;
  });

  return {
    data: documents,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// Fetch all distinct subjects from approved documents
export async function getSubjects(): Promise<string[]> {
  return [...VALID_SUBJECTS];
}

// Get a single approved document by ID
export async function getDocumentById(
  id: string
): Promise<DocumentListItem | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      id,
      title,
      description,
      subject,
      original_filename,
      file_size,
      content_type,
      uploader_id,
      validation_status,
      validation_failure_reason,
      validated_at,
      created_at,
      updated_at,
      users!uploader_id(email)
      `
    )
    .eq("id", id)
    .eq("validation_status", "APPROVED")
    .single();

  if (error || !data) return null;

  const { users, ...rest } = data as typeof data & {
    users: { email: string } | null;
  };

  return {
    ...rest,
    uploader_email: users?.email,
  } as DocumentListItem;
}

// Get a document by ID regardless of status (for owner access)
export async function getDocumentByIdForOwner(
  id: string,
  uploaderId: string
): Promise<DocumentListItem | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      id,
      title,
      description,
      subject,
      original_filename,
      file_size,
      content_type,
      uploader_id,
      validation_status,
      validation_failure_reason,
      validated_at,
      created_at,
      updated_at,
      users!uploader_id(email)
      `
    )
    .eq("id", id)
    .eq("uploader_id", uploaderId)
    .single();

  if (error || !data) return null;

  const { users, ...rest } = data as typeof data & {
    users: { email: string } | null;
  };

  return {
    ...rest,
    uploader_email: users?.email,
  } as DocumentListItem;
}
