// The AI models used by the whole project.
import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

// Chat model (answers + reranking). Reads GROQ_API_KEY from .env
export const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

// Embeddings for document chunks
export const docEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

// Embeddings for user questions (Gemini has a separate mode for queries)
export const queryEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
  taskType: TaskType.RETRIEVAL_QUERY,
});
