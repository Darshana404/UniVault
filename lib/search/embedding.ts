// Embedding provider interface
// Designed to be replaceable — swap OpenAI or local Transformers provider
// by changing EMBEDDING_PROVIDER in .env.local

import { config } from "@/lib/config";
import { embedLocally } from "./local-embedding";

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}

// Normalize text before embedding:
// - Remove excessive whitespace
// - Truncate to token limit (approx 8000 chars for most models)
export function prepareTextForEmbedding(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

// Build the text to embed for a document
// Combines title, subject, description, and extracted text
export function buildDocumentEmbeddingText(params: {
  title: string;
  subject: string;
  description?: string | null;
  extractedText?: string;
}): string {
  const parts = [
    `Title: ${params.title}`,
    `Subject: ${params.subject}`,
    params.description ? `Description: ${params.description}` : null,
    params.extractedText ? `Content: ${params.extractedText.slice(0, 4000)}` : null,
  ].filter(Boolean);

  return prepareTextForEmbedding(parts.join("\n\n"));
}

// Local Hugging Face Transformers.js embedding provider
class LocalEmbeddingProvider implements EmbeddingProvider {
  private model: string;
  private dimensions: number;

  constructor() {
    this.model = config.embedding.model;
    this.dimensions = config.embedding.dimensions;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const prepared = prepareTextForEmbedding(text);
    const embedding = await embedLocally(prepared);

    return {
      embedding,
      model: this.model,
      dimensions: embedding.length,
    };
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      results.push(await this.generateEmbedding(text));
    }
    return results;
  }
}

// OpenAI embedding provider
class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private model: string;
  private dimensions: number;

  constructor() {
    this.model = config.embedding.model;
    this.dimensions = config.embedding.dimensions;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const apiKey = config.embedding.apiKey;

    if (!apiKey) {
      throw new Error(
        "EMBEDDING_API_KEY is not configured. " +
          "Set it in .env.local to enable semantic search."
      );
    }

    const prepared = prepareTextForEmbedding(text);

    const response = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: prepared,
          model: this.model,
          encoding_format: "float",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Embedding API request failed (${response.status}): ${error}`
      );
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>;
      model: string;
    };

    const embedding = data.data[0]?.embedding;

    if (!embedding || embedding.length === 0) {
      throw new Error("Embedding API returned empty embedding.");
    }

    return {
      embedding,
      model: data.model ?? this.model,
      dimensions: embedding.length,
    };
  }

  async generateBatchEmbeddings(
    texts: string[]
  ): Promise<EmbeddingResult[]> {
    // Process in parallel with a concurrency limit of 5
    const BATCH_SIZE = 5;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((text) => this.generateEmbedding(text))
      );
      results.push(...batchResults);
    }

    return results;
  }
}

// Factory — returns the configured provider
export function getEmbeddingProvider(): EmbeddingProvider {
  const provider = config.embedding.provider;

  switch (provider) {
    case "local":
      return new LocalEmbeddingProvider();
    case "openai":
      return new OpenAIEmbeddingProvider();
    default:
      throw new Error(
        `Unknown embedding provider: "${provider}". ` +
          `Set EMBEDDING_PROVIDER=local or EMBEDDING_PROVIDER=openai in .env.local.`
      );
  }
}

// Safe wrapper — never throws, returns null on failure
// Used during upload so embedding failures don't block document approval
export async function generateEmbeddingSafe(
  text: string
): Promise<EmbeddingResult | null> {
  try {
    const provider = getEmbeddingProvider();
    return await provider.generateEmbedding(text);
  } catch (err) {
    console.error("[Embedding] Generation failed:", err);
    return null;
  }
}
