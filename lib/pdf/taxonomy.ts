// Configurable subject taxonomy for UniVault
// Each subject maps to an array of keywords that signal relevance
// Keywords are matched against extracted PDF text (case-insensitive)

export interface SubjectDefinition {
  name: string;
  keywords: string[];
  // Minimum keyword matches required to pass classification
  minMatches: number;
}

export const SUBJECT_TAXONOMY: SubjectDefinition[] = [
  {
    name: "Mathematics",
    keywords: [
      "theorem", "proof", "calculus", "algebra", "geometry",
      "differential", "integral", "matrix", "vector", "polynomial",
      "equation", "function", "limit", "derivative", "series",
      "probability", "statistics", "linear", "quadratic", "trigonometry",
      "logarithm", "exponential", "set theory", "topology", "number theory",
    ],
    minMatches: 3,
  },
  {
    name: "Computer Science",
    keywords: [
      "algorithm", "data structure", "programming", "software", "hardware",
      "network", "database", "operating system", "compiler", "recursion",
      "complexity", "array", "linked list", "tree", "graph", "sorting",
      "searching", "binary", "object oriented", "class", "function",
      "variable", "loop", "conditional", "stack", "queue", "hash",
      "machine learning", "artificial intelligence", "neural network",
      "cpu", "memory", "process", "thread", "protocol",
    ],
    minMatches: 3,
  },
  {
    name: "Physics",
    keywords: [
      "force", "energy", "momentum", "velocity", "acceleration",
      "mass", "gravity", "electric", "magnetic", "thermodynamics",
      "quantum", "wave", "frequency", "amplitude", "optics",
      "nuclear", "particle", "atom", "electron", "photon",
      "relativity", "entropy", "pressure", "temperature", "current",
      "voltage", "resistance", "capacitor", "inductor", "circuit",
    ],
    minMatches: 3,
  },
  {
    name: "Chemistry",
    keywords: [
      "molecule", "atom", "element", "compound", "reaction",
      "bond", "electron", "proton", "neutron", "acid",
      "base", "solution", "concentration", "mole", "periodic",
      "organic", "inorganic", "oxidation", "reduction", "catalyst",
      "polymer", "enzyme", "protein", "carbon", "hydrogen",
      "oxygen", "nitrogen", "equilibrium", "thermochemistry", "kinetics",
    ],
    minMatches: 3,
  },
  {
    name: "Biology",
    keywords: [
      "cell", "organism", "evolution", "genetics", "dna",
      "rna", "protein", "enzyme", "membrane", "nucleus",
      "chromosome", "gene", "mutation", "species", "ecology",
      "photosynthesis", "respiration", "metabolism", "tissue", "organ",
      "nervous system", "immune", "bacteria", "virus", "fungus",
      "anatomy", "physiology", "mitosis", "meiosis", "taxonomy",
    ],
    minMatches: 3,
  },
  {
    name: "Economics",
    keywords: [
      "supply", "demand", "market", "price", "inflation",
      "gdp", "trade", "fiscal", "monetary", "policy",
      "microeconomics", "macroeconomics", "equilibrium", "elasticity",
      "cost", "revenue", "profit", "utility", "consumer",
      "producer", "competition", "monopoly", "oligopoly", "externality",
      "investment", "capital", "labour", "wage", "interest rate",
    ],
    minMatches: 3,
  },
  {
    name: "Engineering",
    keywords: [
      "design", "system", "circuit", "signal", "control",
      "mechanical", "electrical", "civil", "structural", "material",
      "stress", "strain", "load", "thermal", "fluid",
      "dynamics", "statics", "vibration", "manufacturing", "process",
      "prototype", "simulation", "analysis", "optimization", "tolerance",
      "sensor", "actuator", "feedback", "amplifier", "transformer",
    ],
    minMatches: 3,
  },
  {
    name: "Literature",
    keywords: [
      "novel", "poem", "poetry", "prose", "narrative",
      "character", "plot", "theme", "metaphor", "symbolism",
      "author", "genre", "fiction", "tragedy", "comedy",
      "sonnet", "stanza", "rhyme", "alliteration", "imagery",
      "protagonist", "antagonist", "conflict", "resolution", "setting",
      "modernism", "romanticism", "realism", "postmodernism", "criticism",
    ],
    minMatches: 3,
  },
  {
    name: "History",
    keywords: [
      "war", "revolution", "empire", "civilization", "century",
      "dynasty", "colonial", "independence", "treaty", "constitution",
      "monarchy", "democracy", "republic", "industrial", "renaissance",
      "reformation", "enlightenment", "nationalism", "imperialism",
      "parliament", "election", "president", "king", "queen",
      "ancient", "medieval", "modern", "archaeological", "historical",
    ],
    minMatches: 3,
  },
  {
    name: "General",
    keywords: [
      "study", "notes", "lecture", "exam", "assignment",
      "question", "answer", "chapter", "unit", "module",
      "introduction", "conclusion", "summary", "reference", "definition",
    ],
    minMatches: 2,
  },
];

// Get all valid subject names for Zod validation
export const VALID_SUBJECTS = SUBJECT_TAXONOMY.map((s) => s.name);

// Get subject definition by name
export function getSubjectDefinition(
  name: string
): SubjectDefinition | undefined {
  return SUBJECT_TAXONOMY.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
}

