// Step 2: split text into chunks. Two strategies to compare.
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { docEmbeddings } from "./models.js";
import { cosine, sleep } from "./utils.js";

// ---------- 1) Fixed chunking (baseline) ----------
// Cuts the text every ~1000 characters, no matter what the text means.
export async function fixedChunk(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return splitter.splitText(text);
}

// ---------- 2) Semantic chunking ----------
// Cuts the text where the topic changes.
const THRESHOLD = Number(process.env.SEMANTIC_THRESHOLD) || 0.7; // below this = new topic
const MIN_CHUNK = 300;  // don't make chunks smaller than this (characters)
const MAX_CHUNK = 1500; // don't make chunks bigger than this (characters)

// Embed many sentences in small batches (avoids API rate limits)
async function embedSentences(sentences) {
  const vectors = [];
  for (let i = 0; i < sentences.length; i += 50) {
    const batch = sentences.slice(i, i + 50);
    vectors.push(...(await docEmbeddings.embedDocuments(batch)));
    await sleep(800);
  }
  return vectors;
}

export async function semanticChunk(text) {
  // 1. split text into sentences
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  // 2. turn every sentence into a vector
  const vectors = await embedSentences(sentences);

  // 3. walk through sentences, start a new chunk when the topic changes
  const chunks = [];
  let current = sentences[0];

  for (let i = 1; i < sentences.length; i++) {
    const similarity = cosine(vectors[i - 1], vectors[i]);
    const topicChanged = similarity < THRESHOLD && current.length >= MIN_CHUNK;
    const tooLong = current.length + sentences[i].length > MAX_CHUNK;

    if (topicChanged || tooLong) {
      chunks.push(current);
      current = sentences[i];
    } else {
      current += " " + sentences[i];
    }
  }
  chunks.push(current);
  return chunks;
}
