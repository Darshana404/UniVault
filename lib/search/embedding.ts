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

// Google Gemini embedding provider (free tier via Google AI Studio)
class GeminiEmbeddingProvider implements EmbeddingProvider {
  private model: string;
  private dimensions: number;

  constructor() {
    this.model = config.embedding.model || "text-embedding-004";
    this.dimensions = config.embedding.dimensions || 384;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const apiKey = config.embedding.apiKey;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. " +
          "Set it in .env.local or Vercel environment variables to enable semantic search."
      );
    }

    const prepared = prepareTextForEmbedding(text);

    // Call Google Generative Language API embedContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `models/${this.model}`,
        content: {
          parts: [{ text: prepared }],
        },
        outputDimensionality: this.dimensions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API request failed (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as {
      embedding?: { values: number[] };
    };

    const embedding = data.embedding?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Gemini API returned empty embedding.");
    }

    return {
      embedding,
      model: this.model,
      dimensions: embedding.length,
    };
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const apiKey = config.embedding.apiKey;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // Google Gemini batchEmbedContents endpoint accepts up to 100 texts at once
    const BATCH_SIZE = 20;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:batchEmbedContents?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: batch.map((text) => ({
            model: `models/${this.model}`,
            content: {
              parts: [{ text: prepareTextForEmbedding(text) }],
            },
            outputDimensionality: this.dimensions,
          })),
        }),
      });

      if (!response.ok) {
        // Fallback to sequential generation if batch failed
        const fallbackResults = await Promise.all(
          batch.map((text) => this.generateEmbedding(text))
        );
        results.push(...fallbackResults);
        continue;
      }

      const data = (await response.json()) as {
        embeddings?: Array<{ values: number[] }>;
      };

      if (!data.embeddings || data.embeddings.length === 0) {
        const fallbackResults = await Promise.all(
          batch.map((text) => this.generateEmbedding(text))
        );
        results.push(...fallbackResults);
        continue;
      }

      for (const item of data.embeddings) {
        results.push({
          embedding: item.values,
          model: this.model,
          dimensions: item.values.length,
        });
      }
    }

    return results;
  }
}

// Hugging Face Inference API embedding provider (free tier)
class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  private model: string;
  private dimensions: number;

  constructor() {
    this.model = config.embedding.model || "sentence-transformers/all-MiniLM-L6-v2";
    this.dimensions = config.embedding.dimensions || 384;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const apiKey = config.embedding.apiKey;

    if (!apiKey) {
      throw new Error(
        "HF_API_KEY / EMBEDDING_API_KEY is not configured. " +
          "Set it in .env.local or Vercel environment variables to enable semantic search."
      );
    }

    const prepared = prepareTextForEmbedding(text);

    // Call Hugging Face Serverless Inference API
    // Using the official router endpoint for feature extraction
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${this.model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prepared,
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hugging Face API request failed (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    // HF feature extraction returns number[] or number[][]
    let embedding: number[];
    if (Array.isArray(data) && typeof data[0] === "number") {
      embedding = data as number[];
    } else if (Array.isArray(data) && Array.isArray(data[0])) {
      embedding = data[0] as number[];
    } else {
      throw new Error("Unexpected response structure from Hugging Face API.");
    }

    if (!embedding || embedding.length === 0) {
      throw new Error("Hugging Face API returned empty embedding.");
    }

    return {
      embedding,
      model: this.model,
      dimensions: embedding.length,
    };
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
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
    case "gemini":
      if (!config.embedding.apiKey) {
        return new LocalEmbeddingProvider();
      }
      return new GeminiEmbeddingProvider();
    case "huggingface":
      if (!config.embedding.apiKey) {
        return new LocalEmbeddingProvider();
      }
      return new HuggingFaceEmbeddingProvider();
    case "local":
      return new LocalEmbeddingProvider();
    case "openai":
      // If openai is selected but no API key is provided, gracefully fallback to local vendored model
      if (!config.embedding.apiKey) {
        return new LocalEmbeddingProvider();
      }
      return new OpenAIEmbeddingProvider();
    default:
      if (config.embedding.apiKey) {
        return new GeminiEmbeddingProvider();
      }
      return new LocalEmbeddingProvider();
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
