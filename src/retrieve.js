// Gets the best chunks for a question, with or without the reranker.
import { search } from "./store.js";
import { rerank } from "./reranker.js";

export async function retrieve(question, collectionName, useReranker) {
  if (!useReranker) {
    return search(question, collectionName, 3);
  }
  const candidates = await search(question, collectionName, 10); // get more...
  return rerank(question, candidates, 3);                        // ...keep the best 3
}
