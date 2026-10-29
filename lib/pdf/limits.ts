// Shared upload limits. Imported by both the server validator and the
// client upload form, so keep this file free of Node-only imports.

export const MIN_FILE_SIZE = 50 * 1024; // 50 KB
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// Minimum share of non-space characters that must be letters.
// Formulas, code and numbers lower this naturally, so keep it below 0.5.
export const MIN_ALPHA_RATIO = 0.4;