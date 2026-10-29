// Local embeddings with Transformers.js. No network access at inference time.
// Model files are vendored in models/ and verified against the manifest first.
import path from "path";
import type { FeatureExtractionPipeline } from "@huggingface/transformers";
import { verifyModelFiles } from "./model-integrity";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractor: FeatureExtractionPipeline | null = null;
let loading: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (extractor) return extractor;

  if (!loading) {
    loading = (async () => {
      // Refuse to load anything that does not match the pinned manifest
      verifyModelFiles();

      const { pipeline, env } = await import("@huggingface/transformers");

      // Never fetch models from the internet at runtime
      env.allowRemoteModels = false;
      env.localModelPath = path.join(process.cwd(), "models");

      const loaded = (await pipeline("feature-extraction", MODEL_ID, {
        dtype: "q8",
      })) as FeatureExtractionPipeline;

      extractor = loaded;
      return loaded;
    })().catch((err) => {
      // Allow a retry on the next call if loading failed
      loading = null;
      throw err;
    });
  }

  return loading;
}

// Returns a normalised 384-dimension vector
export async function embedLocally(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
