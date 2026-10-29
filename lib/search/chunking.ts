// Splits text into semantic chunks suitable for embedding models (e.g. all-MiniLM-L6-v2)
// Model context window is ~256 tokens (~800-1000 characters).
// We chunk with overlap to preserve context across chunk boundaries.

export interface ChunkOptions {
  maxChunkSize?: number; // target maximum characters per chunk
  overlap?: number;      // character overlap between adjacent chunks
  title?: string;
  subject?: string;
  description?: string | null;
}

export interface DocumentChunk {
  index: number;
  content: string;
}

export function chunkDocumentText(
  text: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const maxChunkSize = options.maxChunkSize ?? 800;
  const overlap = options.overlap ?? 120;

  // Normalize text: collapse excessive empty lines and whitespace
  const cleanText = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanText) {
    // If body text is empty, create a single chunk from title and subject
    const fallback = [
      options.title ? `Title: ${options.title}` : "",
      options.subject ? `Subject: ${options.subject}` : "",
      options.description ? `Description: ${options.description}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return [{ index: 0, content: fallback || "No content" }];
  }

  // Split text into paragraphs
  const paragraphs = cleanText.split(/\n\n+/);
  const rawChunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (current.length + trimmedPara.length + 2 <= maxChunkSize) {
      current = current ? `${current}\n\n${trimmedPara}` : trimmedPara;
    } else {
      if (current) {
        rawChunks.push(current);
      }
      // If a single paragraph exceeds maxChunkSize, split it by sentence or length
      if (trimmedPara.length > maxChunkSize) {
        const sentences = trimmedPara.split(/(?<=[.?!])\s+/);
        let subCurrent = "";
        for (const sentence of sentences) {
          if (subCurrent.length + sentence.length + 1 <= maxChunkSize) {
            subCurrent = subCurrent ? `${subCurrent} ${sentence}` : sentence;
          } else {
            if (subCurrent) rawChunks.push(subCurrent);
            if (sentence.length > maxChunkSize) {
              // Forced hard split for huge unbroken strings
              let pos = 0;
              while (pos < sentence.length) {
                rawChunks.push(sentence.slice(pos, pos + maxChunkSize));
                pos += maxChunkSize - overlap;
              }
              subCurrent = "";
            } else {
              subCurrent = sentence;
            }
          }
        }
        current = subCurrent;
      } else {
        current = trimmedPara;
      }
    }
  }

  if (current) {
    rawChunks.push(current);
  }

  // If no chunks were created, fallback
  if (rawChunks.length === 0) {
    rawChunks.push(cleanText.slice(0, maxChunkSize));
  }

  // Add document context prefix to each chunk so vectors retain document identity
  const chunks: DocumentChunk[] = rawChunks.map((content, index) => {
    let contextualContent: string;
    if (index === 0) {
      const headerParts = [
        options.title ? `[Document: ${options.title} | Subject: ${options.subject ?? "General"}]` : "",
        options.description ? `Summary: ${options.description}` : "",
        content,
      ].filter(Boolean);
      contextualContent = headerParts.join("\n\n");
    } else {
      const header = options.title
        ? `[Document: ${options.title} | Section ${index + 1}]\n\n`
        : "";
      contextualContent = `${header}${content}`;
    }

    return {
      index,
      content: contextualContent.slice(0, 1200), // Safety upper bound for model
    };
  });

  return chunks;
}
