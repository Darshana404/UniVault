import { describe, it, expect } from "vitest";
import { classifySubject } from "@/lib/pdf/subject-classifier";

const CS_TEXT = `
  This document covers algorithms, data structures, and programming concepts.
  We examine sorting algorithms including quicksort, mergesort, and binary search.
  Object-oriented programming with classes and functions is discussed.
  The complexity analysis uses Big-O notation for arrays and linked lists.
  Recursive algorithms and dynamic programming are also covered.
  Database design and network protocols are introduced briefly.
`;

const MATH_TEXT = `
  This document covers differential calculus and integral theorems.
  We examine polynomial equations, vector spaces, and matrix algebra.
  Linear transformations and eigenvalues are discussed in detail.
  The proof of the fundamental theorem uses limit definitions.
  Probability distributions and statistical inference are introduced.
  Trigonometric functions and logarithmic series are also covered.
`;

describe("classifySubject", () => {
  it("passes text that matches the declared subject", () => {
    const result = classifySubject(CS_TEXT, "Computer Science", "CS Notes");
    expect(result.passed).toBe(true);
    expect(result.matchedSubject).toBe("Computer Science");
    expect(result.matchCount).toBeGreaterThan(0);
  });

  it("passes math text declared as Mathematics", () => {
    const result = classifySubject(MATH_TEXT, "Mathematics", "Math Notes");
    expect(result.passed).toBe(true);
  });

  it("fails when declared subject does not match content", () => {
    const result = classifySubject(
      CS_TEXT,
      "Biology",
      "Definitely not biology"
    );
    expect(result.passed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("fails with an unknown subject", () => {
    const result = classifySubject(
      CS_TEXT,
      "InvalidSubject",
      "Some title"
    );
    expect(result.passed).toBe(false);
  });

  it("includes match count in the result", () => {
    const result = classifySubject(CS_TEXT, "Computer Science", "CS Notes");
    expect(typeof result.matchCount).toBe("number");
    expect(result.matchCount).toBeGreaterThan(0);
  });
});

