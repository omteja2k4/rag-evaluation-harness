import "dotenv/config";
import express from "express";
import { retrieve } from "./src/retrieve.js";
import { generateAnswer } from "./src/generator.js";
import { runEvaluation } from "./src/evaluate.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("public")); // serves public/index.html

// Ask a question
// body: { prompt: "...", strategy: "fixed" | "semantic", rerank: true | false }
app.post("/chat", async (req, res) => {
  try {
    const { prompt, strategy = "semantic", rerank = false } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });
    if (!["fixed", "semantic"].includes(strategy)) {
      return res.status(400).json({ error: "strategy must be 'fixed' or 'semantic'" });
    }

    const chunks = await retrieve(prompt, strategy, rerank);
    const answer = await generateAnswer(prompt, chunks);
    res.json({ answer, sources: chunks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Run the evaluation harness (takes a minute or two)
app.post("/evaluate", async (req, res) => {
  try {
    const results = await runEvaluation();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
