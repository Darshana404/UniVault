import { createHash } from "crypto";
import fs from "fs";
import path from "path";

let verified = false;

export function verifyModelFiles(): void {
  if (verified) return;

  const modelsRoot = path.join(process.cwd(), "models");
  const manifestPath = path.join(modelsRoot, "MODEL_MANIFEST.txt");

  if (!fs.existsSync(manifestPath)) {
    throw new Error("Model manifest missing: models/MODEL_MANIFEST.txt");
  }

  const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/);
  let checked = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("revision:")) {
      continue;
    }

    const [expected, relPath] = line.split(/\s+/, 2);
    if (!expected || !relPath) {
      throw new Error(`Malformed manifest line: ${line}`);
    }

    const file = path.join(modelsRoot, relPath);
    if (!fs.existsSync(file)) {
      throw new Error(`Model file missing: ${relPath}`);
    }

    const contents = fs.readFileSync(file);

    // Normalize line endings for text files so hashes are
    // consistent across Windows and Linux.
    const isTextFile = /\.(json|txt|jsonl|vocab|merges)$/i.test(relPath);

    const hashInput = isTextFile
      ? contents.toString("utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n")
      : contents;

    const actual = createHash("sha256")
      .update(hashInput)
      .digest("hex");

    if (actual !== expected.toLowerCase()) {
      throw new Error(`Model file hash mismatch: ${relPath}`);
    }

    checked++;
  }

  if (checked === 0) {
    throw new Error("Model manifest lists no files.");
  }

  verified = true;
}
