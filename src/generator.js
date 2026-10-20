// Step 5: ask the LLM to answer using only the retrieved chunks, with citations.
import { llm } from "./models.js";

export async function generateAnswer(question, chunks) {
  const context = chunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n");

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You are a helpful RAG assistant. Answer ONLY using the context below. " +
        "After each fact, cite the source number like [1] or [2]. " +
        "If the answer is not in the context, say you don't know.\n\n" +
        `Context:\n${context}`,
    },
    { role: "human", content: question },
  ]);

  return result.content;
}
