// Manages chunk-level embedding generation and persistence for documents
// Embedding failures never block document approval — they are tracked
// and can be retried independently

import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { getEmbeddingProvider, buildDocumentEmbeddingText } from "./embedding";
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
    const provider = getEmbeddingProvider();

    // Generate primary document-level embedding for pgvector document matching
    const docText = buildDocumentEmbeddingText({
      title: options.title,
      subject: options.subject,
      description: options.description,
      extractedText: options.extractedText,
    });

    const docEmbedding = await provider.generateEmbedding(docText);

    // Save embedding directly to document_embeddings table
    const { error: statusError } = await supabase
      .from("document_embeddings")
      .upsert(
        {
          document_id: options.documentId,
          embedding: JSON.stringify(docEmbedding.embedding),
          embedding_model: docEmbedding.model ?? config.embedding.model,
          embedding_status: "SUCCESS",
          error_message: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "document_id" }
      );

    if (statusError) {
      throw new Error(`Failed to update status: ${statusError.message}`);
    }

    // Optionally store chunk-level embeddings if document_chunks table exists
    try {
      const chunks = chunkDocumentText(options.extractedText ?? "", {
        title: options.title,
        subject: options.subject,
        description: options.description,
        maxChunkSize: 800,
        overlap: 120,
      });

      if (chunks.length > 0) {
        const chunkTexts = chunks.map((c) => c.content);
        const embeddingResults = await provider.generateBatchEmbeddings(chunkTexts);

        await supabase
          .from("document_chunks")
          .delete()
          .eq("document_id", options.documentId);

        const chunkRows = chunks.map((chunk, i) => ({
          document_id: options.documentId,
          chunk_index: chunk.index,
          content: chunk.content,
          embedding: JSON.stringify(embeddingResults[i]?.embedding ?? []),
        }));

        await supabase.from("document_chunks").insert(chunkRows);
      }
    } catch {
      // document_chunks table is optional; ignore if not present in schema
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
    .in("embedding_status", ["FAILED", "PENDING"])
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
