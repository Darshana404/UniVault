import { describe, it, expect } from "vitest";
import { classifySubject } from "@/lib/pdf/subject-classifier";

const CSE_CORE_TEXT =
  "This unit covers the data structure of arrays and linked lists. " +
  "We study algorithm complexity, the operating system scheduler, and compiler design. " +
  "Recursion is discussed with examples.";

const ECON_TEXT =
  "The demand curve and supply curve determine price. " +
  "Elasticity measures responsiveness. A monopoly sets prices above marginal cost. " +
  "Inflation and GDP growth are macroeconomic indicators.";

describe("classifySubject (programme-based)", () => {
  it("passes CSE text declared as B.Tech CSE (Core)", () => {
    const r = classifySubject(CSE_CORE_TEXT, "B.Tech CSE (Core)", "Data Structures Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("B.Tech CSE (Core)");
  });

  it("passes economics text declared as B.Sc Economics", () => {
    const r = classifySubject(ECON_TEXT, "B.Sc Economics", "Micro Notes");
    expect(r.passed).toBe(true);
  });

  it("rejects economics text declared as CSE and names the right programme", () => {
    const r = classifySubject(ECON_TEXT, "B.Tech CSE (Core)", "Notes");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("B.Sc Economics");
  });

  it("rejects an unknown programme", () => {
    const r = classifySubject(CSE_CORE_TEXT, "Mathematics", "Notes");
    expect(r.passed).toBe(false);
  });

  it("passes AI/ML notes declared as a cyber security programme", () => {
    const AI_TEXT =
      "This unit covers machine learning and neural network training. " +
      "We discuss supervised learning, gradient descent, and random forest classifiers. " +
      "Deep learning models are evaluated on held-out data.";
    const r = classifySubject(AI_TEXT, "B.Tech CSE (Cyber Security)", "ML Notes");
    expect(r.passed).toBe(true);
  });
});