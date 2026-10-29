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

// Programmes whose content legitimately overlaps. A document declared as one
// of these passes if it matches any listed neighbour. Edit this map to tune.
const RELATED_PROGRAMMES: Record<string, string[]> = {
  "B.Tech CSE (Core)": [
    "B.Tech CSE (Cyber Security)",
    "B.Tech AI & DS",
    "B.Tech CSE (IoT)",
    "B.Tech IT",
  ],
  "B.Tech CSE (Cyber Security)": [
    "B.Tech CSE (Core)",
    "B.Tech AI & DS",
    "B.Tech CSE (IoT)",
    "B.Tech IT",
  ],
  "B.Tech AI & DS": [
    "B.Tech CSE (Core)",
    "B.Tech CSE (Cyber Security)",
    "B.Tech IT",
    "B.Sc Economics",
  ],
  "B.Tech CSE (IoT)": ["B.Tech CSE (Core)", "B.Tech ECE", "B.Tech EEE"],
  "B.Tech IT": [
    "B.Tech CSE (Core)",
    "B.Tech CSE (Cyber Security)",
    "B.Tech AI & DS",
  ],
  "B.Tech ECE": ["B.Tech CSE (IoT)", "B.Tech EEE"],
  "B.Tech EEE": ["B.Tech ECE", "B.Tech CSE (IoT)"],
  "B.Tech Mechanical": ["B.Tech Chemical", "B.Tech Civil"],
  "B.Tech Civil": ["B.Tech Mechanical"],
  "B.Tech Chemical": ["B.Tech Mechanical", "B.Tech Biomedical Engineering"],
  "B.Tech Biomedical Engineering": ["B.Tech Chemical", "B.Tech ECE"],
  "B.Com Professional Accounting": ["B.Com General"],
  "B.Com General": ["B.Com Professional Accounting", "B.Sc Economics"],
  "B.Sc Economics": ["B.Com General", "B.Tech AI & DS"],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Counts distinct keywords found as whole words (simple plurals allowed)
function countMatches(text: string, keywords: string[]): number {
  return keywords.filter((keyword) => {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegex(keyword.toLowerCase())}(?:e?s)?(?![a-z0-9])`,
      "i"
    );
    return pattern.test(text);
  }).length;
}

export function classifySubject(
  extractedText: string,
  declaredSubject: string,
  title: string
): ClassificationResult {
  const text = `${title}\n${extractedText}`.toLowerCase();

  const declared: SubjectDefinition | undefined =
    getSubjectDefinition(declaredSubject);

  if (!declared) {
    return {
      passed: false,
      matchCount: 0,
      reason: `"${declaredSubject}" is not a recognised programme. Please select one from the list.`,
    };
  }

  // Hit count for every programme, computed once
  const scores = SUBJECT_TAXONOMY.map((course) => ({
    course,
    hits: countMatches(text, course.keywords),
  }));

  const hitsFor = (name: string) =>
    scores.find((s) => s.course.name === name)?.hits ?? 0;

  const declaredHits = hitsFor(declared.name);

  // 1. Matches its own programme
  if (declaredHits >= declared.minMatches) {
    return {
      passed: true,
      matchedSubject: declared.name,
      matchCount: declaredHits,
    };
  }

  // 2. Matches a related programme (e.g. AI notes in a cyber programme)
  const neighbours = (RELATED_PROGRAMMES[declared.name] ?? [])
    .map((name) => scores.find((s) => s.course.name === name))
    .filter(
      (s): s is (typeof scores)[number] =>
        s !== undefined && s.hits >= s.course.minMatches
    )
    .sort((a, b) => b.hits - a.hits);

  if (neighbours.length > 0) {
    return {
      passed: true,
      matchedSubject: declared.name,
      matchCount: neighbours[0]!.hits,
    };
  }

  // 3. Clearly belongs to an unrelated programme: reject and say which one
  const unrelatedBest = scores
    .filter(
      (s) =>
        s.course.name !== declared.name &&
        !(RELATED_PROGRAMMES[declared.name] ?? []).includes(s.course.name) &&
        s.hits >= s.course.minMatches
    )
    .sort((a, b) => b.hits - a.hits)[0];

  if (unrelatedBest && unrelatedBest.hits >= declaredHits * 2) {
    return {
      passed: false,
      matchCount: declaredHits,
      reason: `This looks like a "${unrelatedBest.course.name}" document, but it was declared as "${declared.name}". Please select the correct programme.`,
    };
  }

  return {
    passed: false,
    matchCount: declaredHits,
    reason: `This document does not appear to belong to "${declared.name}" (${declaredHits} relevant keyword(s) found, minimum ${declared.minMatches}).`,
  };
}