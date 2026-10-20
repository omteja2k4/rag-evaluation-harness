// Run:  npm run eval
// Prints the hit rate of the 3 setups.
import "dotenv/config";
import { runEvaluation } from "../src/evaluate.js";

const results = await runEvaluation();

console.log("\n=== Retrieval Hit Rate ===");
console.table(
  results.map((r) => ({
    Setup: r.name,
    Hits: `${r.hits}/${r.total}`,
    "Hit rate": r.hitRate + "%",
  }))
);
