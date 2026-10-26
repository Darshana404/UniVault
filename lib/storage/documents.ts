import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";

const BUCKET = config.supabase.storageBucket;

export interface UploadResult {
  storagePath: string;
}

// Upload a PDF buffer to Supabase Storage
// Returns the storage path on success
export async function uploadPDFToStorage(
  buffer: Buffer,
  uploaderId: string,
  _originalFilename: string,
  contentHash: string
): Promise<UploadResult> {
  const supabase = createServiceClient();

  // Build a path that is:
  // - Organised by uploader
  // - Named by content hash to prevent duplicates
  // - Never uses client-supplied paths
  const ext = "pdf";
  const storagePath = `uploads/${uploaderId}/${contentHash}-${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false, // Never overwrite — content hash + uuid guarantees uniqueness
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return { storagePath };
}

// Delete a PDF from storage
export async function deletePDFFromStorage(
  storagePath: string
): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    // Log but do not throw — caller decides how to handle
    console.error("[Storage] Delete failed:", error.message);
  }
}

// Generate a short-lived signed URL for authorized download
export async function generateSignedDownloadURL(
  storagePath: string,
  expiresInSeconds: number = 300 // 5 minutes
): Promise<string> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error("Failed to generate download link.");
  }

  return data.signedUrl;
}

