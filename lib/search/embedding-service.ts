// Manages chunk-level embedding generation and persistence for documents
// Embedding failures never block document approval — they are tracked
// and can be retried independently

import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { getEmbeddingProvider } from "./embedding";
import { chunkDocumentText } from "./chunking";
import { extractTextFromPDF } from "@/lib/pdf/extractor";

export interface GenerateAndStoreOptions {
  documentId: string;
  title: string;
  subject: string;
  description?: string | null;
  extractedText?: string;
}

// Generate chunk-level embeddings for a document and store them in document_chunks
// Returns true if successful, false if failed
// Never throws — embedding is non-blocking
export async function generateAndStoreEmbedding(
  options: GenerateAndStoreOptions
): Promise<boolean> {
  const supabase = createServiceClient();

  // Mark as in-progress in document_embeddings
  await supabase
    .from("document_embeddings")
    .upsert(
      {
        document_id: options.documentId,
        embedding_status: "PENDING",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "document_id" }
    );

  try {
    // Split document into chunks (approx 800 chars each with overlap)
    const chunks = chunkDocumentText(options.extractedText ?? "", {
      title: options.title,
      subject: options.subject,
      description: options.description,
      maxChunkSize: 800,
      overlap: 120,
    });

    const provider = getEmbeddingProvider();

    // Generate vector embeddings for all chunks in batch
    const chunkTexts = chunks.map((c) => c.content);
    const embeddingResults = await provider.generateBatchEmbeddings(chunkTexts);

    if (embeddingResults.length === 0) {
      throw new Error("No embeddings generated for document chunks.");
    }

    // Replace old chunks for this document
    await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", options.documentId);

    // Prepare rows for document_chunks table
    const chunkRows = chunks.map((chunk, i) => ({
      document_id: options.documentId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: JSON.stringify(embeddingResults[i]?.embedding ?? []),
    }));

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(chunkRows);

    if (chunkError) {
      throw new Error(`Failed to store chunks: ${chunkError.message}`);
    }

    // Mark document_embeddings as SUCCESS
    const { error: statusError } = await supabase
      .from("document_embeddings")
      .upsert(
        {
          document_id: options.documentId,
          embedding_model: embeddingResults[0]?.model ?? config.embedding.model,
          embedding_status: "SUCCESS",
          error_message: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "document_id" }
      );

    if (statusError) {
      throw new Error(`Failed to update status: ${statusError.message}`);
    }

    return true;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown embedding error";

    console.error(
      `[Embedding] Failed for document ${options.documentId}:`,
      errorMessage
    );

    // Mark as failed — can be retried later
    await supabase
      .from("document_embeddings")
      .upsert(
        {
          document_id: options.documentId,
          embedding_status: "FAILED",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "document_id" }
      );

    return false;
  }
}

// Retry all failed embeddings
// Reads stored PDF from Supabase storage if text is not available
export async function retryFailedEmbeddings(): Promise<{
  attempted: number;
  succeeded: number;
}> {
  const supabase = createServiceClient();

  const { data: failed } = await supabase
    .from("document_embeddings")
    .select(
      `
      document_id,
      documents!document_id (
        id, title, subject, description, storage_path
      )
      `
    )
    .eq("embedding_status", "FAILED")
    .limit(50);

  if (!failed || failed.length === 0) {
    return { attempted: 0, succeeded: 0 };
  }

  let succeeded = 0;

  for (const record of failed) {
    const doc = record.documents as unknown as {
      id: string;
      title: string;
      subject: string;
      description: string | null;
      storage_path?: string;
    } | null;

    if (!doc) continue;

    let extractedText = "";

    // Attempt to download PDF and extract text for existing documents
    if (doc.storage_path) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(config.supabase.storageBucket)
          .download(doc.storage_path);

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const extraction = await extractTextFromPDF(buffer);
          if (extraction.success && extraction.text) {
            extractedText = extraction.text;
          }
        }
      } catch (dlErr) {
        console.warn(`[Embedding Retry] Could not extract text for ${doc.id}:`, dlErr);
      }
    }

    const success = await generateAndStoreEmbedding({
      documentId: doc.id,
      title: doc.title,
      subject: doc.subject,
      description: doc.description,
      extractedText,
    });

    if (success) succeeded++;
  }

  return { attempted: failed.length, succeeded };
}
