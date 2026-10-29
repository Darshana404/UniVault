import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const modelsRoot = path.join(process.cwd(), "models");
const manifestPath = path.join(modelsRoot, "MODEL_MANIFEST.txt");

const textExtensions = new Set([
  ".json",
  ".txt",
  ".jsonl",
  ".vocab",
  ".merges",
]);

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

const original = fs.readFileSync(manifestPath, "utf8");

const updated = original.split(/\r?\n/).map((line) => {
  const trimmed = line.trim();

  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("revision:")
  ) {
    return line;
  }

  const match = trimmed.match(/^([a-fA-F0-9]{64})\s+(.+?)\s*$/);

  if (!match) {
    throw new Error(`Malformed manifest line: ${line}`);
  }

  const [, oldHash, relPath] = match;
  const extension = path.extname(relPath).toLowerCase();

  // Leave binary-file hashes unchanged.
  if (!textExtensions.has(extension)) {
    return line;
  }

  const filePath = path.join(modelsRoot, relPath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Model file missing: ${relPath}`);
  }

  // Convert CRLF and CR to LF before hashing.
  const normalized = fs
    .readFileSync(filePath, "utf8")
    .replace(/\r\n?/g, "\n");

  const newHash = sha256(Buffer.from(normalized, "utf8"));

  console.log(`${relPath}: ${oldHash} -> ${newHash}`);

  return line.replace(oldHash, newHash);
});

fs.writeFileSync(manifestPath, updated.join("\n"), "utf8");

console.log("Manifest text-file hashes updated.");
console.log("Binary-file hashes were left unchanged.");