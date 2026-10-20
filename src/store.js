// Step 3: save chunks in Qdrant (vector database) and search them.
import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";
import { docEmbeddings, queryEmbeddings } from "./models.js";

const config = (collectionName) => ({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName,
});

// Delete the old collection (if any), then save the new chunks.
export async function saveChunks(chunks, collectionName) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  try {
    await client.deleteCollection(collectionName);
  } catch {
    // collection did not exist yet, that's fine
  }

  const docs = chunks.map((text) => new Document({ pageContent: text }));
  await QdrantVectorStore.fromDocuments(docs, docEmbeddings, config(collectionName));
}

// Find the k chunks most similar to the question. Returns plain text strings.
const stores = {}; // cache so we connect only once per collection

export async function search(question, collectionName, k = 3) {
  if (!stores[collectionName]) {
    stores[collectionName] = await QdrantVectorStore.fromExistingCollection(
      queryEmbeddings,
      config(collectionName)
    );
  }
  const results = await stores[collectionName].similaritySearch(question, k);
  return results.map((doc) => doc.pageContent);
}
