// Degree-programme taxonomy for uploads.
// A document passes when it contains at least `minMatches` of its declared
// programme's keywords. Matching is whole-word and case-insensitive.
// Programme names are stored in documents.subject, so do not rename them
// once documents exist.

export interface SubjectDefinition {
  name: string;
  keywords: string[];
  minMatches: number;
}

export const SUBJECT_TAXONOMY: SubjectDefinition[] = [
  {
    name: "Common (First Year)",
    minMatches: 3,
    keywords: [
      "engineering mathematics", "calculus", "differential equation",
      "engineering physics", "engineering chemistry", "engineering graphics",
      "linear algebra", "laplace transform", "eigenvalue",
      "partial derivative", "engineering mechanics", "environmental science",
    ],
  },
  {
    name: "B.Tech CSE (Core)",
    minMatches: 3,
    keywords: [
      "data structure", "algorithm", "operating system", "compiler",
      "database management", "normalization", "deadlock", "scheduling",
      "paging", "object oriented programming", "recursion", "big-o",
      "computer network", "tcp/ip", "software engineering", "automata",
      "turing machine", "context-free grammar", "process synchronization",
      "virtual memory",
    ],
  },
  {
    name: "B.Tech CSE (Cyber Security)",
    minMatches: 3,
    keywords: [
      "cybersecurity", "cryptography", "encryption", "firewall", "intrusion",
      "malware", "penetration testing", "vulnerability", "phishing",
      "ethical hacking", "digital forensics", "network security",
      "access control", "threat", "exploit", "zero trust", "ssl", "tls",
      "public key", "symmetric key", "hash function", "authentication",
    ],
  },
  {
    name: "B.Tech CSE (IoT)",
    minMatches: 3,
    keywords: [
      "internet of things", "iot", "arduino", "raspberry pi", "mqtt",
      "zigbee", "lorawan", "wireless sensor network", "edge computing",
      "rtos", "smart home", "telemetry", "embedded system", "gateway",
      "bluetooth", "microcontroller", "cloud gateway", "sensor node",
    ],
  },
  {
    name: "B.Tech AI & DS",
    minMatches: 3,
    keywords: [
      "machine learning", "deep learning", "neural network", "data science",
      "regression", "classification model", "supervised learning",
      "unsupervised learning", "clustering", "natural language processing",
      "computer vision", "reinforcement learning", "feature engineering",
      "random forest", "gradient descent", "tensorflow", "pytorch",
      "pandas", "numpy", "data visualization", "decision tree",
    ],
  },
  {
    name: "B.Tech IT",
    minMatches: 3,
    keywords: [
      "web development", "html", "css", "javascript", "cloud computing",
      "devops", "information systems", "erp", "rest api", "virtualization",
      "system administration", "frontend", "backend", "docker", "kubernetes",
      "it infrastructure", "web application", "enterprise application",
    ],
  },
  {
    name: "B.Tech ECE",
    minMatches: 3,
    keywords: [
      "analog electronics", "digital electronics", "communication system",
      "modulation", "demodulation", "antenna", "transistor", "microwave",
      "vlsi", "signal processing", "fourier transform", "op-amp",
      "operational amplifier", "fpga", "verilog", "vhdl",
      "radio frequency", "bandwidth", "pcb", "filter design",
    ],
  },
  {
    name: "B.Tech EEE",
    minMatches: 3,
    keywords: [
      "power system", "electrical machine", "induction motor",
      "synchronous machine", "power electronics", "transmission line",
      "generator", "inverter", "rectifier", "high voltage", "switchgear",
      "power grid", "load flow", "protection relay", "dc machine",
      "three-phase", "kirchhoff", "ohm's law", "transformer",
    ],
  },
  {
    name: "B.Tech Mechanical",
    minMatches: 3,
    keywords: [
      "thermodynamics", "fluid mechanics", "heat transfer", "machine design",
      "kinematics", "manufacturing process", "casting", "welding", "machining",
      "lathe", "finite element", "stress analysis", "strength of materials",
      "gear", "bearing", "turbine", "ic engine", "refrigeration",
      "mechatronics", "cad",
    ],
  },
  {
    name: "B.Tech Civil",
    minMatches: 3,
    keywords: [
      "structural analysis", "reinforced concrete", "concrete", "geotechnical",
      "soil mechanics", "foundation", "surveying", "highway", "bridge",
      "hydraulics", "water supply", "transportation engineering",
      "building construction", "bitumen", "pavement", "rcc",
      "steel structure", "retaining wall", "footing",
    ],
  },
  {
    name: "B.Tech Chemical",
    minMatches: 3,
    keywords: [
      "reactor", "distillation", "mass transfer", "heat exchanger",
      "process control", "chemical process", "unit operations",
      "reaction kinetics", "chemical engineering", "petroleum",
      "crystallization", "evaporation", "absorption", "catalysis",
      "fluidized bed", "separation process", "process plant",
    ],
  },
  {
    name: "B.Tech Biomedical Engineering",
    minMatches: 3,
    keywords: [
      "biomedical", "medical device", "biosignal", "ecg", "eeg",
      "medical imaging", "prosthesis", "biomaterial", "tissue engineering",
      "physiological", "clinical", "diagnostic", "biosensor", "mri",
      "ultrasound", "patient monitoring", "bio instrumentation", "pacemaker",
    ],
  },
  {
    name: "B.Com Professional Accounting",
    minMatches: 3,
    keywords: [
      "accounting", "balance sheet", "journal entry", "ledger",
      "trial balance", "depreciation", "financial statement", "auditing",
      "income tax", "gst", "cost accounting", "profit and loss",
      "accounting standard", "bookkeeping", "goodwill",
      "partnership accounts", "companies act", "auditor",
    ],
  },
  {
    name: "B.Com General",
    minMatches: 3,
    keywords: [
      "commerce", "business", "marketing", "management",
      "human resource", "organisational behaviour", "entrepreneurship",
      "corporate", "banking", "insurance", "business law", "contract act",
      "supply chain", "consumer behaviour", "brand", "sales",
      "stock market", "budgeting",
    ],
  },
  {
    name: "B.Sc Economics",
    minMatches: 3,
    keywords: [
      "economics", "microeconomics", "macroeconomics", "demand curve",
      "supply curve", "elasticity", "inflation", "gdp", "monetary policy",
      "fiscal policy", "market structure", "monopoly", "oligopoly",
      "game theory", "econometrics", "consumer surplus", "producer surplus",
      "keynesian", "unemployment", "balance of payments", "national income",
    ],
  },
];

export const VALID_SUBJECTS = SUBJECT_TAXONOMY.map((s) => s.name);

export function getSubjectDefinition(
  name: string
): SubjectDefinition | undefined {
  const target = name.trim().toLowerCase();
  return SUBJECT_TAXONOMY.find((s) => s.name.toLowerCase() === target);
}