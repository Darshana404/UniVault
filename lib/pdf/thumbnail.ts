// Generates first-page PNG preview thumbnails for academic PDFs using pdfjs-dist and canvas
import path from "path";
import { pathToFileURL } from "url";
import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";

const BUCKET = config.supabase.storageBucket;

// Tells pdf.js to use the node "canvas" library for its internal canvases,
// so embedded images draw correctly on the server.
type NodeCanvas = {
  width: number;
  height: number;
  getContext(type: "2d"): CanvasRenderingContext2D;
};

const nodeCanvasFactory = {
  async create(width: number, height: number) {
    const { createCanvas } = await import("@napi-rs/canvas");
    const canvas = createCanvas(width, height) as unknown as NodeCanvas;
    return { canvas, context: canvas.getContext("2d") };
  },
  reset(target: { canvas: NodeCanvas }, width: number, height: number) {
    target.canvas.width = width;
    target.canvas.height = height;
  },
  destroy(target: { canvas: NodeCanvas }) {
    target.canvas.width = 0;
    target.canvas.height = 0;
  },
};

export async function generatePDFThumbnail(
  pdfBuffer: Buffer,
  targetWidth: number = 360
): Promise<Buffer | null> {
  try {
    const { createCanvas } = await import("@napi-rs/canvas");

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const workerFile = path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.mjs"
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerFile).href;

    const uint8 = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      useSystemFonts: true,
      disableFontFace: true,
      canvasFactory: nodeCanvasFactory,
    } as Parameters<typeof pdfjsLib.getDocument>[0]);

    const doc = await loadingTask.promise;
    if (doc.numPages < 1) return null;

    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1.0 });

    const scale = Math.max(0.2, Math.min(2.0, targetWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });

    const canvasWidth = Math.max(1, Math.round(viewport.width));
    const canvasHeight = Math.max(1, Math.round(viewport.height));

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Pre-fill with crisp white sheet background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render page 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    return canvas.toBuffer("image/png");
  } catch (err) {
    console.error("[PDF Thumbnail] Failed to render page 1:", err);
    return null;
  }
}

// Upload a generated thumbnail to Supabase Storage
export async function uploadThumbnailToStorage(
  documentId: string,
  thumbnailBuffer: Buffer
): Promise<string | null> {
  try {
    const supabase = createServiceClient();
      const thumbnailPath = `thumbnails/v2/${documentId}.png`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/png",
        upsert: true,
        cacheControl: "86400",
      });

    if (error) {
      console.warn(`[Thumbnail Upload] Failed to save thumbnail for ${documentId}:`, error.message);
      return null;
    }

    return thumbnailPath;
  } catch (err) {
    console.warn(`[Thumbnail Upload] Error saving thumbnail for ${documentId}:`, err);
    return null;
  }
}

// Retrieves existing thumbnail or generates on-demand and caches to storage
export async function getOrCreateDocumentThumbnail(
  documentId: string,
  storagePath: string
): Promise<Buffer | null> {
  const supabase = createServiceClient();
  const thumbnailPath = `thumbnails/v2/${documentId}.png`;

  // 1. Check if thumbnail is already cached in storage
  try {
    const { data: cached, error: cacheError } = await supabase.storage
      .from(BUCKET)
      .download(thumbnailPath);

    if (!cacheError && cached) {
      return Buffer.from(await cached.arrayBuffer());
    }
  } catch {
    // Cache miss, proceed to generate
  }

  // 2. Download original PDF to generate thumbnail
  try {
    const { data: pdfFile, error: pdfError } = await supabase.storage
      .from(BUCKET)
      .download(storagePath);

    if (pdfError || !pdfFile) {
      console.error(`[Thumbnail] Could not download PDF ${storagePath}:`, pdfError?.message);
      return null;
    }

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const thumbnail = await generatePDFThumbnail(pdfBuffer);

    if (!thumbnail) return null;

    // Cache thumbnail asynchronously in storage for future instant retrieval
    void uploadThumbnailToStorage(documentId, thumbnail);

    return thumbnail;
  } catch (err) {
    console.error(`[Thumbnail] Error generating thumbnail for ${documentId}:`, err);
    return null;
  }
}

