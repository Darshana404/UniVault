import { z } from "zod";

export const DocumentSearchSchema = z.object({
  q: z.string().max(200).optional(),
  subject: z.string().max(100).optional(),
  sort: z.enum(["created_at", "title"]).optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  semantic: z.coerce.boolean().optional().default(false),
});

export const DocumentIdSchema = z.object({
  id: z.string().uuid("Invalid document ID."),
});

export const UploadMetadataSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title must be at most 200 characters."),
  description: z.string().max(1000).optional(),
  subject: z
    .string()
    .min(1, "Subject is required.")
    .max(100, "Subject must be at most 100 characters."),
});

