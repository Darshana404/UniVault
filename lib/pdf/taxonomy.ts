// Course taxonomy for uploads.
// A document passes when it contains at least `minMatches` of its declared
// course's keywords. Matching is whole-word and case-insensitive.
// Course names are stored in documents.subject, so do not rename them
// once documents exist.

export interface SubjectDefinition {
  name: string;
  keywords: string[];
  minMatches: number;
}

export const SUBJECT_TAXONOMY: SubjectDefinition[] = [

  // ── COMMON FIRST YEAR ──────────────────────────────────────────────────
  {
    name: "Calculus",
    minMatches: 2,
    keywords: [
      "calculus", "differentiation", "integration", "limits",
      "derivative", "integral", "taylor series", "maclaurin",
      "partial derivative", "multivariable", "vector calculus",
    ],
  },
  {
    name: "Linear Algebra",
    minMatches: 2,
    keywords: [
      "linear algebra", "matrix", "eigenvalue", "eigenvector",
      "vector space", "determinant", "rank", "span", "basis",
      "linear transformation", "orthogonality",
    ],
  },
  {
    name: "Discrete Mathematics",
    minMatches: 2,
    keywords: [
      "discrete mathematics", "propositional logic",
      "set theory", "relations", "combinatorics",
      "permutation", "combination", "graph theory",
      "recurrence relation", "boolean algebra",
    ],
  },
  {
    name: "Probability and Statistics",
    minMatches: 2,
    keywords: [
      "probability", "statistics", "random variable", "distribution",
      "mean", "variance", "standard deviation", "hypothesis testing",
      "bayes theorem", "normal distribution",
      "binomial distribution", "poisson", "stochastic",
    ],
  },
  {
    name: "Engineering Physics",
    minMatches: 2,
    keywords: [
      "engineering physics", "wave", "optics", "quantum mechanics",
      "laser", "fiber optics", "semiconductor physics",
      "thermodynamics", "electromagnetism",
    ],
  },
  {
    name: "Engineering Graphics",
    minMatches: 2,
    keywords: [
      "engineering graphics", "orthographic projection",
      "isometric", "sectional view", "cad drawing",
      "autocad", "dimensioning", "blueprint",
    ],
  },
  {
    name: "Communicative English",
    minMatches: 2,
    keywords: [
      "communicative english", "technical writing", "grammar",
      "vocabulary", "reading comprehension", "writing skills",
      "presentation skills", "professional communication",
    ],
  },
  {
    name: "Environmental Science and Engineering",
    minMatches: 2,
    keywords: [
      "environmental science", "pollution", "ecosystem",
      "biodiversity", "climate change", "waste management",
      "renewable energy", "sustainability", "environmental impact",
    ],
  },
  {
    name: "Professional Ethics and Human Values",
    minMatches: 2,
    keywords: [
      "professional ethics", "human values", "moral",
      "intellectual property", "plagiarism", "code of conduct",
      "engineering ethics", "social responsibility",
    ],
  },

  // ── CSE CORE ───────────────────────────────────────────────────────────
  {
    name: "Problem Solving and Programming in C",
    minMatches: 2,
    keywords: [
      "programming in c", "c language", "c program",
      "printf", "scanf", "pointer", "array in c",
      "function in c", "struct", "file handling in c",
      "problem solving", "flowchart",
    ],
  },
  {
    name: "Object Oriented Programming",
    minMatches: 2,
    keywords: [
      "object oriented", "oop", "class", "object",
      "inheritance", "polymorphism", "encapsulation", "abstraction",
      "constructor", "destructor", "overloading", "overriding",
      "interface", "c++", "java",
    ],
  },
  {
    name: "Data Structures",
    minMatches: 2,
    keywords: [
      "data structure", "linked list", "stack", "queue",
      "binary tree", "bst", "heap", "hashing",
      "traversal", "inorder", "preorder", "postorder",
      "sorting", "searching",
    ],
  },
  {
    name: "Design and Analysis of Algorithms",
    minMatches: 2,
    keywords: [
      "algorithm", "time complexity", "space complexity",
      "big o", "divide and conquer", "dynamic programming",
      "greedy", "backtracking", "np complete", "np hard",
      "sorting algorithm", "graph algorithm", "shortest path",
      "minimum spanning tree", "kruskal", "dijkstra",
    ],
  },
  {
    name: "Database Management Systems",
    minMatches: 2,
    keywords: [
      "database", "dbms", "sql", "normalization",
      "entity relationship", "er diagram", "relational model",
      "transaction", "acid", "indexing", "query optimization",
      "primary key", "foreign key", "nosql",
    ],
  },
  {
    name: "Operating Systems",
    minMatches: 2,
    keywords: [
      "operating system", "process", "thread", "scheduling",
      "deadlock", "memory management", "paging", "segmentation",
      "virtual memory", "file system", "ipc",
      "semaphore", "mutex", "synchronization", "kernel",
    ],
  },
  {
    name: "Computer Organization and Architecture",
    minMatches: 2,
    keywords: [
      "computer organization", "computer architecture", "coa",
      "instruction set", "isa", "cpu", "alu", "control unit",
      "pipeline", "cache", "memory hierarchy", "risc", "cisc",
      "addressing mode", "register", "interrupt",
    ],
  },
  {
    name: "Computer Networks",
    minMatches: 2,
    keywords: [
      "computer network", "osi model", "tcp", "udp",
      "network layer", "transport layer", "routing",
      "switching", "mac address", "ethernet", "dns",
      "http", "socket", "bandwidth", "protocol",
    ],
  },
  {
    name: "Theory of Computation",
    minMatches: 2,
    keywords: [
      "theory of computation", "automata", "finite automaton",
      "dfa", "nfa", "regular expression", "context free grammar",
      "pushdown automaton", "turing machine", "decidability",
      "halting problem", "pumping lemma", "cfg",
    ],
  },
  {
    name: "Software Engineering",
    minMatches: 2,
    keywords: [
      "software engineering", "sdlc", "software development",
      "requirements analysis", "uml", "use case",
      "agile", "scrum", "waterfall", "testing",
      "software design", "design pattern", "software architecture",
    ],
  },
  {
    name: "Web Technologies",
    minMatches: 2,
    keywords: [
      "web technology", "html", "css", "javascript",
      "frontend", "backend", "rest api", "json",
      "react", "nodejs", "php", "web application",
      "responsive design", "dom", "ajax",
    ],
  },
  {
    name: "Cloud Computing",
    minMatches: 2,
    keywords: [
      "cloud computing", "iaas", "paas", "saas",
      "aws", "azure", "google cloud", "virtualization",
      "docker", "kubernetes", "microservices",
      "serverless", "cloud storage", "cloud deployment",
    ],
  },
  {
    name: "Distributed Systems",
    minMatches: 2,
    keywords: [
      "distributed system", "distributed computing",
      "consistency", "cap theorem", "fault tolerance",
      "replication", "consensus", "raft", "paxos",
      "message passing", "rpc", "distributed database",
      "load balancing", "horizontal scaling",
    ],
  },

  // ── CYBER SECURITY ─────────────────────────────────────────────────────
  {
    name: "Cyber Security Essentials",
    minMatches: 2,
    keywords: [
      "cyber security", "information security", "cia triad",
      "confidentiality", "integrity", "availability",
      "threat", "vulnerability", "risk", "attack",
      "security policy", "firewall", "antivirus",
    ],
  },
  {
    name: "Classical Cryptography",
    minMatches: 2,
    keywords: [
      "classical cryptography", "caesar cipher", "substitution cipher",
      "transposition cipher", "vigenere", "playfair",
      "one time pad", "frequency analysis", "ciphertext",
      "plaintext", "cryptanalysis",
    ],
  },
  {
    name: "Modern Cryptography",
    minMatches: 2,
    keywords: [
      "modern cryptography", "aes", "des", "rsa",
      "public key cryptography", "private key", "symmetric key",
      "asymmetric encryption", "digital signature",
      "hash function", "sha", "md5", "diffie hellman",
      "elliptic curve", "key exchange",
    ],
  },
  {
    name: "System Security Management",
    minMatches: 2,
    keywords: [
      "system security", "access control", "authentication",
      "authorization", "privilege", "patch management",
      "hardening", "vulnerability assessment", "security audit",
      "incident response", "security management",
    ],
  },
  {
    name: "Network Penetration Testing",
    minMatches: 2,
    keywords: [
      "penetration testing", "pentest", "network pen test",
      "nmap", "metasploit", "exploitation", "scanning",
      "enumeration", "footprinting", "reconnaissance",
      "network attack", "port scanning",
    ],
  },
  {
    name: "Ethical Hacking and Social Engineering",
    minMatches: 2,
    keywords: [
      "ethical hacking", "social engineering", "phishing",
      "pretexting", "spear phishing", "vishing",
      "white hat", "black hat", "bug bounty",
      "ceh", "security testing", "hacking methodology",
    ],
  },
  {
    name: "Cyber Forensics",
    minMatches: 2,
    keywords: [
      "cyber forensics", "digital forensics", "forensic investigation",
      "evidence collection", "chain of custody", "disk image",
      "forensic tools", "log analysis", "memory forensics",
      "network forensics", "incident investigation",
    ],
  },
  {
    name: "Web Application Security",
    minMatches: 2,
    keywords: [
      "web application security", "owasp", "sql injection",
      "xss", "cross site scripting", "csrf",
      "broken authentication", "insecure deserialization",
      "security misconfiguration", "burp suite",
      "web vulnerability", "input validation",
    ],
  },
  {
    name: "Intrusion Detection Systems",
    minMatches: 2,
    keywords: [
      "intrusion detection", "ids", "ips",
      "intrusion prevention", "anomaly detection",
      "signature based", "network monitoring",
      "siem", "log monitoring", "alert",
    ],
  },
  {
    name: "Blockchain Technology",
    minMatches: 2,
    keywords: [
      "blockchain", "distributed ledger", "smart contract",
      "ethereum", "bitcoin", "consensus mechanism",
      "proof of work", "proof of stake", "nft",
      "decentralized", "cryptocurrency", "solidity",
    ],
  },
  {
    name: "Quantum Cryptography",
    minMatches: 2,
    keywords: [
      "quantum cryptography", "quantum key distribution",
      "qkd", "bb84", "quantum entanglement",
      "post quantum", "quantum computing security",
      "qubit", "quantum channel",
    ],
  },

  // ── AI & DATA SCIENCE ──────────────────────────────────────────────────
  {
    name: "Foundations of Artificial Intelligence",
    minMatches: 2,
    keywords: [
      "artificial intelligence", "search algorithm",
      "bfs", "dfs", "a star", "heuristic",
      "knowledge representation", "expert system",
      "inference engine", "planning",
      "constraint satisfaction",
    ],
  },
  {
    name: "Machine Learning Techniques",
    minMatches: 2,
    keywords: [
      "machine learning", "supervised learning", "unsupervised learning",
      "linear regression", "logistic regression", "decision tree",
      "random forest", "svm", "support vector machine",
      "k nearest neighbour", "k means", "clustering",
      "cross validation", "overfitting", "underfitting",
    ],
  },
  {
    name: "Deep Learning",
    minMatches: 2,
    keywords: [
      "deep learning", "neural network", "cnn", "rnn",
      "lstm", "transformer", "attention mechanism",
      "backpropagation", "gradient descent", "activation function",
      "dropout", "batch normalization", "tensorflow", "pytorch",
    ],
  },
  {
    name: "Natural Language Processing",
    minMatches: 2,
    keywords: [
      "natural language processing", "nlp", "text classification",
      "sentiment analysis", "tokenization", "stemming",
      "named entity recognition", "ner", "pos tagging",
      "word embedding", "word2vec", "bert", "language model",
    ],
  },
  {
    name: "Computer Vision",
    minMatches: 2,
    keywords: [
      "computer vision", "image classification", "object detection",
      "image segmentation", "feature extraction", "opencv",
      "yolo", "convolutional", "image processing",
      "edge detection", "face recognition",
    ],
  },
  {
    name: "Big Data Analytics",
    minMatches: 2,
    keywords: [
      "big data", "hadoop", "spark", "mapreduce",
      "hdfs", "hive", "pig", "kafka",
      "data pipeline", "batch processing", "stream processing",
      "data warehouse", "etl", "olap",
    ],
  },
  {
    name: "Data Visualization and Mining",
    minMatches: 2,
    keywords: [
      "data visualization", "data mining", "association rule",
      "apriori", "frequent itemset", "anomaly detection",
      "dashboard", "tableau", "power bi", "matplotlib",
      "seaborn", "d3.js",
    ],
  },

  // ── IoT ────────────────────────────────────────────────────────────────
  {
    name: "Fundamentals of IoT",
    minMatches: 2,
    keywords: [
      "internet of things", "iot", "iot architecture",
      "iot protocol", "mqtt", "coap", "smart device",
      "connected device", "iot platform", "iot gateway",
      "iot application", "iot ecosystem",
    ],
  },
  {
    name: "Sensor Integration and Microcontrollers",
    minMatches: 2,
    keywords: [
      "sensor", "microcontroller", "arduino", "raspberry pi",
      "gpio", "analog sensor", "digital sensor",
      "adc", "dac", "i2c", "spi", "uart",
      "actuator", "servo", "temperature sensor",
    ],
  },
  {
    name: "Wireless Communication Techniques",
    minMatches: 2,
    keywords: [
      "wireless communication", "bluetooth", "zigbee",
      "lora", "lorawan", "wifi", "nfc", "rfid",
      "5g", "cellular", "wsn", "wireless sensor network",
      "frequency band", "modulation", "channel",
    ],
  },
  {
    name: "Edge Intelligence",
    minMatches: 2,
    keywords: [
      "edge computing", "edge intelligence", "fog computing",
      "edge ai", "on device", "tinyml", "inference at edge",
      "latency", "edge node", "edge server",
    ],
  },
  {
    name: "Embedded System Architectures",
    minMatches: 2,
    keywords: [
      "embedded system", "rtos", "real time operating system",
      "firmware", "bootloader", "interrupt handler",
      "memory mapped", "microprocessor", "arm cortex",
      "embedded c", "bare metal",
    ],
  },
  {
    name: "Foundation of Robotics",
    minMatches: 2,
    keywords: [
      "robotics", "robot", "kinematics", "ros",
      "path planning", "robot operating system",
      "servo control", "actuator", "robot arm",
      "autonomous robot", "drone", "pid controller",
    ],
  },

  // ── ECE ────────────────────────────────────────────────────────────────
  {
    name: "Electronic Devices and Circuits",
    minMatches: 2,
    keywords: [
      "electronic devices", "diode", "transistor", "bjt",
      "mosfet", "fet", "amplifier", "biasing",
      "rectifier", "clipper", "clamper", "zener",
      "op amp", "operational amplifier",
    ],
  },
  {
    name: "Digital Logic Design",
    minMatches: 2,
    keywords: [
      "digital logic", "logic gate", "boolean", "karnaugh map",
      "combinational circuit", "sequential circuit",
      "flip flop", "latch", "counter", "register",
      "multiplexer", "demultiplexer", "encoder", "decoder",
      "adder", "subtractor",
    ],
  },
  {
    name: "Signals and Systems",
    minMatches: 2,
    keywords: [
      "signals and systems", "continuous signal", "discrete signal",
      "fourier transform", "laplace transform", "z transform",
      "convolution", "impulse response", "transfer function",
      "frequency response", "sampling theorem",
    ],
  },
  {
    name: "Digital Signal Processing",
    minMatches: 2,
    keywords: [
      "digital signal processing", "dsp", "fft",
      "discrete fourier transform", "filter design",
      "iir filter", "fir filter", "digital filter",
      "windowing", "quantization", "dft",
    ],
  },
  {
    name: "Analog and Digital Communication",
    minMatches: 2,
    keywords: [
      "analog communication", "digital communication",
      "amplitude modulation", "frequency modulation",
      "phase modulation", "am", "fm", "pm",
      "ask", "fsk", "psk", "qam",
      "noise", "snr", "channel capacity",
    ],
  },
  {
    name: "VLSI Design",
    minMatches: 2,
    keywords: [
      "vlsi", "very large scale integration",
      "cmos", "fpga", "verilog", "vhdl",
      "logic synthesis", "place and route",
      "timing analysis", "chip design", "asic",
    ],
  },
  {
    name: "Electromagnetics and Antennas",
    minMatches: 2,
    keywords: [
      "electromagnetics", "antenna", "maxwell equation",
      "wave propagation", "transmission line",
      "radiation pattern", "gain", "dipole antenna",
      "microwave", "rf", "radio frequency",
    ],
  },
  {
    name: "Microprocessors and Microcontrollers",
    minMatches: 2,
    keywords: [
      "microprocessor", "8085", "8086", "assembly language",
      "instruction set", "addressing mode",
      "interrupt", "dma", "memory interface",
      "peripheral", "bus interface",
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