// Small helper functions used in several files.

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cosine similarity between two number arrays (1 = same meaning, 0 = unrelated).
export function cosine(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Run an async function, and try again a few times if it fails (API rate limits).
export async function withRetry(fn, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === tries) throw err;
      await sleep(2000 * attempt);
    }
  }
}
