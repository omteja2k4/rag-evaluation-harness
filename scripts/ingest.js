// Run once:  npm run ingest
// Reads the PDF, builds BOTH collections (fixed + semantic) in Qdrant.
import "dotenv/config";
import { loadPdf } from "../src/loader.js";
import { fixedChunk, semanticChunk } from "../src/chunkers.js";
import { saveChunks } from "../src/store.js";

const pdfPath = process.argv[2] || "data/knowledge.pdf";

console.log("Reading", pdfPath);
const text = await loadPdf(pdfPath);

console.log("Fixed chunking...");
const fixed = await fixedChunk(text);
await saveChunks(fixed, "fixed");
console.log(`  saved ${fixed.length} chunks`);

console.log("Semantic chunking (this takes a bit)...");
const semantic = await semanticChunk(text);
await saveChunks(semantic, "semantic");
console.log(`  saved ${semantic.length} chunks`);

console.log("Done. Now run: npm run eval   or   npm start");
