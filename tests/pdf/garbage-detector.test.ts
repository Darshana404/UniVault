import { describe, it, expect } from "vitest";
import { detectGarbage } from "@/lib/pdf/garbage-detector";

// Normal academic paragraph
const GOOD_TEXT = `
  The study of algorithms is fundamental to computer science.
  An algorithm is a step-by-step procedure for solving a problem or
  accomplishing a task. In the context of data structures, algorithms
  help us efficiently organize and manipulate data. Common examples
  include sorting algorithms such as quicksort and mergesort, and
  searching algorithms like binary search. The time complexity of an
  algorithm is measured using Big-O notation, which describes the
  worst-case performance as the input size grows.
`.repeat(3);

const REPETITIVE_TEXT = "aaa ".repeat(500);
const VERY_SHORT_TEXT = "Hi there";

describe("detectGarbage", () => {
  it("passes normal academic text", () => {
    const result = detectGarbage(GOOD_TEXT);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.4);
  });

  it("rejects highly repetitive text", () => {
    const result = detectGarbage(REPETITIVE_TEXT);
    expect(result.passed).toBe(false);
  });

  it("rejects very short text", () => {
    const result = detectGarbage(VERY_SHORT_TEXT);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain("insufficient");
  });

  it("returns a score between 0 and 1 for passing text", () => {
    const result = detectGarbage(GOOD_TEXT);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("returns a reason string when failing", () => {
    const result = detectGarbage(REPETITIVE_TEXT);
    expect(result.reason).toBeTruthy();
    expect(typeof result.reason).toBe("string");
  });
});

