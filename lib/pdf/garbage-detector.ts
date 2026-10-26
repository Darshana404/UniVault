// Detects low-quality or garbage content using:
// 1. Character entropy (randomness measure)
// 2. Alphabetic character ratio
// 3. Unique word density
// 4. Average word length

export interface GarbageDetectionResult {
  passed: boolean;
  score: number; // 0 = garbage, 1 = clean
  reason?: string;
}

// Calculate Shannon entropy of a string
// High entropy = random/compressed data
// Low entropy = repetitive content
// Normal text: 3.5–5.0 bits per character
function calculateEntropy(text: string): number {
  if (text.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const char of text) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

// Ratio of alphabetic characters to total non-whitespace characters
function getAlphaRatio(text: string): number {
  const nonSpace = text.replace(/\s/g, "");
  if (nonSpace.length === 0) return 0;
  const alphaCount = (nonSpace.match(/[a-zA-Z]/g) ?? []).length;
  return alphaCount / nonSpace.length;
}

// Ratio of unique words to total words (vocabulary richness)
function getUniqueDensity(text: string): number {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

// Average word length (normal English: 4–6 characters)
function getAverageWordLength(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  return totalLength / words.length;
}

export function detectGarbage(
  text: string
): GarbageDetectionResult {
  if (text.length < 50) {
    return {
      passed: false,
      score: 0,
      reason: "Document contains insufficient readable text.",
    };
  }

  const entropy = calculateEntropy(text);
  const alphaRatio = getAlphaRatio(text);
  const uniqueDensity = getUniqueDensity(text);
  const avgWordLength = getAverageWordLength(text);

  // Entropy check:
  // < 2.0 = highly repetitive (likely garbage)
  // > 6.5 = highly random (likely binary data or corrupted)
  if (entropy < 2.0) {
    return {
      passed: false,
      score: entropy / 6,
      reason: "Document content appears to be highly repetitive or meaningless.",
    };
  }

  if (entropy > 6.5) {
    return {
      passed: false,
      score: 1 - (entropy - 6.5) / 2,
      reason: "Document content appears to be corrupted or contains binary data.",
    };
  }

  // Alpha ratio check:
  // Legitimate academic text is at least 60% alphabetic characters
  if (alphaRatio < 0.6) {
    return {
      passed: false,
      score: alphaRatio,
      reason: `Document has too few readable characters (${Math.round(alphaRatio * 100)}% alphabetic). Expected at least 60%.`,
    };
  }

  // Average word length check:
  // Normal academic text: 3–12 characters per word
  if (avgWordLength < 2 || avgWordLength > 20) {
    return {
      passed: false,
      score: 0.3,
      reason: `Unusual average word length (${avgWordLength.toFixed(1)} chars). Document may be garbled.`,
    };
  }

  // Unique word density check:
  // Very low density = repetitive content
  if (uniqueDensity < 0.1) {
    return {
      passed: false,
      score: uniqueDensity,
      reason: "Document appears to have very repetitive content.",
    };
  }

  // All checks passed — compute composite quality score
  const normalizedEntropy = Math.min(entropy / 5.0, 1.0);
  const score =
    normalizedEntropy * 0.4 +
    alphaRatio * 0.3 +
    uniqueDensity * 0.2 +
    Math.min(avgWordLength / 8, 1.0) * 0.1;

  return {
    passed: true,
    score: Math.min(score, 1.0),
  };
}

