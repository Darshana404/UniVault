import { describe, it, expect } from "vitest";
import { classifySubject } from "@/lib/pdf/subject-classifier";

// ── Sample texts ──────────────────────────────────────────────────────────────

const DATA_STRUCTURES_TEXT =
  "This unit covers linked lists, binary trees, and hash tables. " +
  "We study stack and queue implementations along with BFS and DFS traversal. " +
  "Sorting algorithms like quicksort and mergesort are analysed.";

const ALGORITHMS_TEXT =
  "Time complexity analysis using Big O notation. " +
  "Divide and conquer, dynamic programming, and greedy algorithms are covered. " +
  "Dijkstra shortest path and Kruskal minimum spanning tree are discussed.";

const OS_TEXT =
  "Process scheduling and thread management in operating systems. " +
  "Deadlock detection, paging, and virtual memory are explained. " +
  "Semaphore and mutex are used for synchronisation.";

const CRYPTOGRAPHY_TEXT =
  "AES and RSA are modern cryptography standards. " +
  "Public key cryptography uses asymmetric encryption and digital signatures. " +
  "SHA hash function and Diffie Hellman key exchange are covered.";

const CLASSICAL_CRYPTO_TEXT =
  "Caesar cipher and Vigenere substitution cipher techniques. " +
  "Frequency analysis is used to break transposition cipher. " +
  "One time pad provides perfect secrecy in classical cryptography.";

const ML_TEXT =
  "Supervised learning with linear regression and decision tree models. " +
  "Support vector machine and k nearest neighbour classifiers are evaluated. " +
  "Cross validation prevents overfitting in machine learning.";

const DEEP_LEARNING_TEXT =
  "Convolutional neural network and LSTM architectures for deep learning. " +
  "Backpropagation and gradient descent optimise the neural network weights. " +
  "Dropout and batch normalisation are regularisation techniques in tensorflow.";

const IOT_TEXT =
  "MQTT protocol and CoAP are used in IoT architecture. " +
  "Smart devices connect through an IoT gateway to the cloud platform. " +
  "The IoT ecosystem enables connected device management.";

const SENSOR_TEXT =
  "Arduino and Raspberry Pi microcontroller GPIO pin configuration. " +
  "I2C and SPI protocols connect analog sensor and digital sensor. " +
  "ADC converts analog signals from temperature sensor to digital values.";

const DIGITAL_LOGIC_TEXT =
  "Karnaugh map simplification of boolean expressions. " +
  "Flip flop and latch are sequential circuit building blocks. " +
  "Multiplexer, decoder, and adder are combinational circuit components.";

const DSP_TEXT =
  "FFT and discrete Fourier transform are core to digital signal processing. " +
  "FIR filter and IIR filter design using windowing techniques. " +
  "Quantization and DFT are applied in DSP applications.";

const CALCULUS_TEXT =
  "Partial derivative and multivariable calculus for vector calculus. " +
  "Taylor series and Maclaurin expansion of functions. " +
  "Integration and differentiation techniques are covered.";

const DBMS_TEXT =
  "SQL joins and query optimisation in database management. " +
  "Normalisation up to BCNF and entity relationship diagram design. " +
  "ACID transactions and indexing improve database performance.";

const UNRELATED_TEXT =
  "The recipe calls for two cups of flour and one egg. " +
  "Bake at 180 degrees for 30 minutes until golden brown. " +
  "Let it cool on a wire rack before serving.";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("classifySubject (course-based)", () => {

  // ── Basic passes ──────────────────────────────────────────────────────

  it("passes data structures text declared as Data Structures", () => {
    const r = classifySubject(DATA_STRUCTURES_TEXT, "Data Structures", "DS Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Data Structures");
  });

  it("passes algorithms text declared as Design and Analysis of Algorithms", () => {
    const r = classifySubject(ALGORITHMS_TEXT, "Design and Analysis of Algorithms", "DAA Unit 2");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Design and Analysis of Algorithms");
  });

  it("passes OS text declared as Operating Systems", () => {
    const r = classifySubject(OS_TEXT, "Operating Systems", "OS Unit 3");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Operating Systems");
  });

  it("passes modern cryptography text declared as Modern Cryptography", () => {
    const r = classifySubject(CRYPTOGRAPHY_TEXT, "Modern Cryptography", "Crypto Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Modern Cryptography");
  });

  it("passes ML text declared as Machine Learning Techniques", () => {
    const r = classifySubject(ML_TEXT, "Machine Learning Techniques", "ML Unit 1");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Machine Learning Techniques");
  });

  it("passes deep learning text declared as Deep Learning", () => {
    const r = classifySubject(DEEP_LEARNING_TEXT, "Deep Learning", "DL Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Deep Learning");
  });

  it("passes IoT text declared as Fundamentals of IoT", () => {
    const r = classifySubject(IOT_TEXT, "Fundamentals of IoT", "IoT Intro");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Fundamentals of IoT");
  });

  it("passes sensor text declared as Sensor Integration and Microcontrollers", () => {
    const r = classifySubject(SENSOR_TEXT, "Sensor Integration and Microcontrollers", "Sensor Lab");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Sensor Integration and Microcontrollers");
  });

  it("passes digital logic text declared as Digital Logic Design", () => {
    const r = classifySubject(DIGITAL_LOGIC_TEXT, "Digital Logic Design", "DLD Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Digital Logic Design");
  });

  it("passes DSP text declared as Digital Signal Processing", () => {
    const r = classifySubject(DSP_TEXT, "Digital Signal Processing", "DSP Unit 2");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Digital Signal Processing");
  });

  it("passes calculus text declared as Calculus", () => {
    const r = classifySubject(CALCULUS_TEXT, "Calculus", "Maths Unit 1");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Calculus");
  });

  it("passes DBMS text declared as Database Management Systems", () => {
    const r = classifySubject(DBMS_TEXT, "Database Management Systems", "DBMS Notes");
    expect(r.passed).toBe(true);
    expect(r.matchedSubject).toBe("Database Management Systems");
  });

  // ── Related course passes (cross-listing) ─────────────────────────────

  it("passes ML text declared as Deep Learning via related course", () => {
    // ML is a neighbour of Deep Learning in RELATED_PROGRAMMES
    const r = classifySubject(ML_TEXT, "Deep Learning", "ML Notes filed under DL");
    expect(r.passed).toBe(true);
  });

  it("passes classical crypto text declared as Modern Cryptography via related course", () => {
    const r = classifySubject(CLASSICAL_CRYPTO_TEXT, "Modern Cryptography", "Crypto History");
    expect(r.passed).toBe(true);
  });

  it("passes DSP text declared as Signals and Systems via related course", () => {
    const r = classifySubject(DSP_TEXT, "Signals and Systems", "DSP filed under SS");
    expect(r.passed).toBe(true);
  });

  it("passes OS text declared as Distributed Systems via related course", () => {
    const r = classifySubject(OS_TEXT, "Distributed Systems", "OS notes");
    expect(r.passed).toBe(true);
  });

  it("passes sensor text declared as Fundamentals of IoT via related course", () => {
    const r = classifySubject(SENSOR_TEXT, "Fundamentals of IoT", "Sensor notes");
    expect(r.passed).toBe(true);
  });

  // ── Hard rejections (clearly wrong subject) ───────────────────────────

  it("rejects DSP text declared as Machine Learning Techniques", () => {
    const r = classifySubject(DSP_TEXT, "Machine Learning Techniques", "Notes");
    expect(r.passed).toBe(false);
  });

  it("rejects calculus text declared as Cyber Security Essentials", () => {
    const r = classifySubject(CALCULUS_TEXT, "Cyber Security Essentials", "Notes");
    expect(r.passed).toBe(false);
  });

  it("rejects IoT text declared as Digital Signal Processing", () => {
    const r = classifySubject(IOT_TEXT, "Digital Signal Processing", "Notes");
    expect(r.passed).toBe(false);
  });

  it("rejects completely unrelated text for any course", () => {
    const r = classifySubject(UNRELATED_TEXT, "Data Structures", "Notes");
    expect(r.passed).toBe(false);
  });

  // ── Unknown course name ───────────────────────────────────────────────

  it("rejects an unrecognised course name", () => {
    const r = classifySubject(DATA_STRUCTURES_TEXT, "B.Tech CSE (Core)", "Notes");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("not a recognised");
  });

  it("rejects another unrecognised course name", () => {
    const r = classifySubject(ML_TEXT, "Artificial Intelligence", "Notes");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("not a recognised");
  });

  // ── Reason string checks ──────────────────────────────────────────────

  it("rejection reason mentions the declared course name", () => {
    const r = classifySubject(UNRELATED_TEXT, "Operating Systems", "Notes");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("Operating Systems");
  });

  it("rejection reason suggests the actual matching course when content clearly belongs elsewhere", () => {
    // DSP content declared as a totally unrelated course — classifier should name DSP
    const r = classifySubject(DSP_TEXT, "Foundation of Robotics", "Notes");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("Digital Signal Processing");
  });

  // ── matchCount sanity checks ──────────────────────────────────────────

  it("returns a positive matchCount for passing results", () => {
    const r = classifySubject(DATA_STRUCTURES_TEXT, "Data Structures", "Notes");
    expect(r.matchCount).toBeGreaterThan(0);
  });

  it("returns matchCount of 0 or 1 for completely unrelated content", () => {
    const r = classifySubject(UNRELATED_TEXT, "Data Structures", "Notes");
    expect(r.matchCount).toBeLessThan(2);
  });
});