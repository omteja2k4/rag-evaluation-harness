// Step 4 (optional): reranker.
// Vector search is fast but rough. Here the LLM reads each chunk and scores
// how well it answers the question, then we keep only the best ones.
import { llm } from "./models.js";

export async function rerank(question, chunks, topN = 3) {
  const list = chunks.map((c, i) => `[${i}] ${c.slice(0, 600)}`).join("\n\n");

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You score how relevant text passages are to a question. " +
        "Reply with ONLY a JSON array of numbers from 0 to 10, one per passage, in order. No explanation.",
    },
    { role: "human", content: `Question: ${question}\n\nPassages:\n${list}` },
  ]);

  // Read the scores, e.g. [2, 9, 0, 4]
  const match = String(result.content).match(/\[[\d.,\s]+\]/);
  const scores = match ? JSON.parse(match[0]) : [];

  // If the LLM answered badly, just keep the original order
  if (scores.length !== chunks.length) return chunks.slice(0, topN);

  return chunks
    .map((chunk, i) => ({ chunk, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((item) => item.chunk);
}
