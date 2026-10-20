# RAG Evaluation Harness

A small Retrieval-Augmented Generation (RAG) app that **measures** retrieval quality instead of guessing.
It compares three setups using a *retrieval hit rate* on an evaluation dataset:

| Setup | What it does |
|---|---|
| Fixed chunking | Cuts the PDF every ~1000 characters (baseline) |
| Semantic chunking | Cuts the PDF where the topic changes (sentence embeddings + cosine similarity) |
| Semantic + Reranker | Retrieves 10 chunks, an LLM scores them, keeps the best 3 |

**Hit rate** = percentage of questions where the correct chunk appears in the top 3 retrieved chunks.

## How it works

```
PDF -> Chunking -> Embeddings (Gemini) -> Qdrant -> Retrieve -> (Reranker) -> Groq LLM -> Cited answer
                                                        ^
                              data/eval_dataset.json ---+--> hit rate
```

## Tech stack

Node.js, Express, LangChain, Google Gemini embeddings (`gemini-embedding-001`), Qdrant Cloud,
Groq (`openai/gpt-oss-120b`), pdf-parse, Chart.js.

## Project structure

```
server.js              Express API (/chat, /evaluate) + serves the UI
public/index.html      Simple UI: ask questions, run evaluation, bar chart
src/loader.js          PDF -> text
src/chunkers.js        fixedChunk() and semanticChunk()
src/store.js           save chunks to Qdrant, search them
src/reranker.js        LLM reranker
src/retrieve.js        search (+ rerank) in one function
src/generator.js       cited answer from the LLM
src/evaluate.js        the hit-rate harness
scripts/ingest.js      builds both Qdrant collections
scripts/eval.js        prints the comparison table
data/knowledge.pdf     sample PDF (Node.js facts) - replace with your own
data/eval_dataset.json sample questions - replace to match your PDF
```

## Setup (VS Code)

1. Install Node.js 20 or newer.
2. Get free keys: [Google AI Studio](https://aistudio.google.com) (Gemini), [Groq](https://console.groq.com), [Qdrant Cloud](https://cloud.qdrant.io) (create a free cluster, copy its URL and API key).
3. In the project folder:
   ```bash
   npm install
   cp .env.example .env      # Windows: copy .env.example .env
   ```
   Open `.env` and paste your keys.
4. Build the vector collections (run once, and again whenever the PDF changes):
   ```bash
   npm run ingest
   ```
5. Compare the three setups in the terminal:
   ```bash
   npm run eval
   ```
6. Or start the app and open http://localhost:5000:
   ```bash
   npm start
   ```

## Use your own PDF

1. Put your PDF at `data/knowledge.pdf` (or run `npm run ingest -- path/to/file.pdf`).
2. Edit `data/eval_dataset.json`. Each item needs a `question` and an `expectedKeyword`,
   a short phrase that appears in the correct passage of your PDF. Aim for 20 to 50 items.
   Write the questions in your own words, not copied from the PDF, so retrieval is a real test.
3. Run `npm run ingest` then `npm run eval`.

**Important:** the sample PDF is tiny, so all three setups will score high. For a meaningful
comparison use a longer document (20+ pages). Report only the numbers from your own run.

## Tuning

- `SEMANTIC_THRESHOLD` in `.env` (default 0.7): higher = more, smaller chunks; lower = fewer, bigger chunks.
- Chunk size limits are at the top of `src/chunkers.js`.

## Troubleshooting

- **429 / rate limit errors:** the free tiers are limited. Wait a minute and rerun; the code already retries and pauses between calls.
- **Collection not found:** run `npm run ingest` first.
- **Wrong vector size error:** delete the `fixed` and `semantic` collections in the Qdrant dashboard and ingest again.

## Resume bullet (use your real numbers)

> Built a RAG evaluation harness (Node.js, LangChain, Gemini embeddings, Qdrant, Groq) that benchmarks fixed vs semantic chunking and LLM reranking by retrieval hit rate on a [N]-question dataset, improving hit rate from [X]% to [Y]%.
