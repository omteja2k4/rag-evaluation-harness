// The evaluation harness.
// For every question we check: did the right chunk come back in the top 3?
// Hit rate = questions answered correctly / total questions.
import fs from "fs";
import { retrieve } from "./retrieve.js";
import { sleep, withRetry } from "./utils.js";

// The 3 setups we compare
const SETUPS = [
  { name: "Fixed Chunking", collection: "fixed", rerank: false },
  { name: "Semantic Chunking", collection: "semantic", rerank: false },
  { name: "Semantic + Reranker", collection: "semantic", rerank: true },
];

// Ignore case and extra spaces/new lines when comparing text
const clean = (text) => text.toLowerCase().replace(/\s+/g, " ");

export async function runEvaluation(datasetPath = "data/eval_dataset.json") {
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  const results = [];

  for (const setup of SETUPS) {
    let hits = 0;

    for (const item of dataset) {
      const chunks = await withRetry(() =>
        retrieve(item.question, setup.collection, setup.rerank)
      );
      const found = chunks.some((chunk) =>
        clean(chunk).includes(clean(item.expectedKeyword))
      );
      if (found) hits++;
      await sleep(600); // be gentle with the APIs
    }

    results.push({
      name: setup.name,
      hits,
      total: dataset.length,
      hitRate: Math.round((hits / dataset.length) * 100),
    });
    console.log(`${setup.name}: ${hits}/${dataset.length}`);
  }
  return results;
}
