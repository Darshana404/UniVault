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

// Courses whose content legitimately overlaps. A document declared as one
// of these passes if it matches any listed neighbour. Edit this map to tune.
const RELATED_PROGRAMMES: Record<string, string[]> = {

  // Maths chain
  "Calculus": ["Linear Algebra", "Discrete Mathematics", "Probability and Statistics"],
  "Linear Algebra": ["Calculus", "Discrete Mathematics", "Probability and Statistics", "Machine Learning Techniques", "Deep Learning"],
  "Discrete Mathematics": ["Calculus", "Linear Algebra", "Theory of Computation", "Design and Analysis of Algorithms"],
  "Probability and Statistics": ["Calculus", "Linear Algebra", "Machine Learning Techniques", "Big Data Analytics"],

  // Core CSE chain
  "Problem Solving and Programming in C": ["Object Oriented Programming", "Data Structures"],
  "Object Oriented Programming": ["Problem Solving and Programming in C", "Data Structures", "Software Engineering", "Web Technologies"],
  "Data Structures": ["Problem Solving and Programming in C", "Design and Analysis of Algorithms", "Object Oriented Programming"],
  "Design and Analysis of Algorithms": ["Data Structures", "Theory of Computation", "Foundations of Artificial Intelligence"],
  "Database Management Systems": ["Operating Systems", "Distributed Systems", "Big Data Analytics"],
  "Operating Systems": ["Computer Organization and Architecture", "Distributed Systems", "Embedded System Architectures"],
  "Computer Organization and Architecture": ["Digital Logic Design", "Operating Systems", "Microprocessors and Microcontrollers"],
  "Computer Networks": ["Distributed Systems", "Cyber Security Essentials", "Wireless Communication Techniques"],
  "Theory of Computation": ["Discrete Mathematics", "Design and Analysis of Algorithms"],
  "Software Engineering": ["Object Oriented Programming", "Web Technologies", "Database Management Systems"],
  "Web Technologies": ["Object Oriented Programming", "Software Engineering", "Web Application Security"],
  "Cloud Computing": ["Distributed Systems", "Computer Networks", "Edge Intelligence"],
  "Distributed Systems": ["Computer Networks", "Operating Systems", "Cloud Computing", "Big Data Analytics"],

  // Cyber security chain
  "Cyber Security Essentials": ["Computer Networks", "System Security Management", "Classical Cryptography"],
  "Classical Cryptography": ["Modern Cryptography", "Cyber Security Essentials"],
  "Modern Cryptography": ["Classical Cryptography", "Quantum Cryptography", "Blockchain Technology"],
  "System Security Management": ["Cyber Security Essentials", "Network Penetration Testing", "Intrusion Detection Systems"],
  "Network Penetration Testing": ["Ethical Hacking and Social Engineering", "System Security Management", "Computer Networks"],
  "Ethical Hacking and Social Engineering": ["Network Penetration Testing", "Web Application Security", "Cyber Forensics"],
  "Cyber Forensics": ["Ethical Hacking and Social Engineering", "System Security Management"],
  "Web Application Security": ["Web Technologies", "Ethical Hacking and Social Engineering", "Cyber Security Essentials"],
  "Intrusion Detection Systems": ["System Security Management", "Computer Networks", "Cyber Security Essentials"],
  "Blockchain Technology": ["Modern Cryptography", "Distributed Systems"],
  "Quantum Cryptography": ["Modern Cryptography"],

  // AI & DS chain
  "Foundations of Artificial Intelligence": ["Machine Learning Techniques", "Design and Analysis of Algorithms"],
  "Machine Learning Techniques": ["Deep Learning", "Foundations of Artificial Intelligence", "Probability and Statistics", "Data Visualization and Mining"],
  "Deep Learning": ["Machine Learning Techniques", "Natural Language Processing", "Computer Vision"],
  "Natural Language Processing": ["Deep Learning", "Machine Learning Techniques", "Data Visualization and Mining"],
  "Computer Vision": ["Deep Learning", "Digital Signal Processing", "Signals and Systems"],
  "Big Data Analytics": ["Database Management Systems", "Distributed Systems", "Data Visualization and Mining"],
  "Data Visualization and Mining": ["Big Data Analytics", "Machine Learning Techniques", "Probability and Statistics"],

  // IoT chain
  "Fundamentals of IoT": ["Sensor Integration and Microcontrollers", "Wireless Communication Techniques", "Edge Intelligence"],
  "Sensor Integration and Microcontrollers": ["Fundamentals of IoT", "Embedded System Architectures", "Electronic Devices and Circuits"],
  "Wireless Communication Techniques": ["Fundamentals of IoT", "Computer Networks", "Analog and Digital Communication"],
  "Edge Intelligence": ["Fundamentals of IoT", "Cloud Computing", "Embedded System Architectures"],
  "Embedded System Architectures": ["Sensor Integration and Microcontrollers", "Microprocessors and Microcontrollers", "Operating Systems"],
  "Foundation of Robotics": ["Sensor Integration and Microcontrollers", "Embedded System Architectures", "Signals and Systems"],

  // ECE chain
  "Electronic Devices and Circuits": ["Digital Logic Design", "Analog and Digital Communication"],
  "Digital Logic Design": ["Computer Organization and Architecture", "VLSI Design", "Electronic Devices and Circuits"],
  "Signals and Systems": ["Digital Signal Processing", "Analog and Digital Communication", "Computer Vision"],
  "Digital Signal Processing": ["Signals and Systems", "Computer Vision", "Analog and Digital Communication"],
  "Analog and Digital Communication": ["Signals and Systems", "Wireless Communication Techniques", "Electromagnetics and Antennas"],
  "VLSI Design": ["Digital Logic Design", "Electronic Devices and Circuits", "Embedded System Architectures"],
  "Electromagnetics and Antennas": ["Analog and Digital Communication", "Wireless Communication Techniques"],
  "Microprocessors and Microcontrollers": ["Computer Organization and Architecture", "Embedded System Architectures", "Digital Logic Design"],
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
      reason: `"${declaredSubject}" is not a recognised course. Please select one from the list.`,
    };
  }

  // Hit count for every course, computed once
  const scores = SUBJECT_TAXONOMY.map((course) => ({
    course,
    hits: countMatches(text, course.keywords),
  }));

  const hitsFor = (name: string) =>
    scores.find((s) => s.course.name === name)?.hits ?? 0;

  const declaredHits = hitsFor(declared.name);

  // 1. Matches its own course
  if (declaredHits >= declared.minMatches) {
    return {
      passed: true,
      matchedSubject: declared.name,
      matchCount: declaredHits,
    };
  }

  // 2. Matches a related course (e.g. ML notes uploaded under Deep Learning)
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

  // 3. Clearly belongs to an unrelated course: reject and say which one
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
      reason: `This looks like a "${unrelatedBest.course.name}" document, but it was declared as "${declared.name}". Please select the correct course.`,
    };
  }

  return {
    passed: false,
    matchCount: declaredHits,
    reason: `This document does not appear to belong to the course "${declared.name}" (${declaredHits} relevant keyword(s) found, minimum ${declared.minMatches}).`,
  };
}