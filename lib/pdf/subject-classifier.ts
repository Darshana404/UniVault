import {
  SUBJECT_TAXONOMY,
  getSubjectDefinition,
  type SubjectDefinition,
} from "./taxonomy";

export interface ClassificationResult {
  passed: boolean;
  matchedSubject?: string;
  matchCount: number;
  reason?: string;
}

// Count how many taxonomy keywords appear in the text
function countKeywordMatches(
  text: string,
  keywords: string[]
): number {
  const lowerText = text.toLowerCase();
  return keywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  ).length;
}

// Check whether extracted text matches the declared subject
export function classifySubject(
  extractedText: string,
  declaredSubject: string,
  title: string
): ClassificationResult {
  const combined = `${title} ${extractedText}`.toLowerCase();

  // Get the declared subject definition
  const subjectDef = getSubjectDefinition(declaredSubject);

  if (!subjectDef) {
    // Unknown subject — use General taxonomy as fallback
    const generalDef = SUBJECT_TAXONOMY.find((s) => s.name === "General");
    if (!generalDef) {
      return {
        passed: false,
        matchCount: 0,
        reason: `Unknown subject: "${declaredSubject}". Please select a valid subject.`,
      };
    }

    const matchCount = countKeywordMatches(combined, generalDef.keywords);
    if (matchCount >= generalDef.minMatches) {
      return { passed: true, matchedSubject: "General", matchCount };
    }

    return {
      passed: false,
      matchCount,
      reason: `Unknown subject "${declaredSubject}" and document does not appear to be academic content.`,
    };
  }

  // Count matches for the declared subject
  const matchCount = countKeywordMatches(combined, subjectDef.keywords);

  if (matchCount >= subjectDef.minMatches) {
    return {
      passed: true,
      matchedSubject: subjectDef.name,
      matchCount,
    };
  }

  // If declared subject fails, check if it matches any other subject
  // This catches mislabelled documents
  const bestMatch = findBestSubjectMatch(combined);

  if (bestMatch) {
    return {
      passed: false,
      matchCount,
      reason: `Document content appears to be "${bestMatch.name}" but was declared as "${declaredSubject}". Please select the correct subject.`,
    };
  }

  return {
    passed: false,
    matchCount,
    reason: `Document does not appear to be related to "${declaredSubject}". Only ${matchCount} relevant keyword(s) found (minimum: ${subjectDef.minMatches}).`,
  };
}

// Find the best matching subject for a given text
function findBestSubjectMatch(
  text: string
): SubjectDefinition | undefined {
  let bestMatch: SubjectDefinition | undefined;
  let bestCount = 0;

  for (const subject of SUBJECT_TAXONOMY) {
    const count = countKeywordMatches(text, subject.keywords);
    if (count >= subject.minMatches && count > bestCount) {
      bestCount = count;
      bestMatch = subject;
    }
  }

  return bestMatch;
}

