import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
// import { HfInference } from "@huggingface/inference";
import { pipeline } from "@xenova/transformers";
import fetch from "node-fetch"; // for server-side fetch

// const embeddings = new HuggingFaceInferenceEmbeddings({
//   apiKey: process.env.HUGGINGFACE_API_KEY,
//   model: "sentence-transformers/all-MiniLM-L6-v2",
// });

// const pinecone = new PineconeClient();

// const pineconeIndex = pinecone.Index("company-bot");

// export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//   pineconeIndex,
//   maxConcurrency: 5,
// });



// Load feature-extraction pipeline (embeddings)
let extractor;
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractor;
}

// --- Pinecone setup ---
const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index("company-bot");

// Custom embedding functions using Xenova
const embeddings = {
  embedQuery: async (text) => {
    const model = await getExtractor();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  },
  embedDocuments: async (texts) => {
    const model = await getExtractor();
    const results = await Promise.all(
      texts.map(async (t) => {
        const output = await model(t, { pooling: "mean", normalize: true });
        return Array.from(output.data);
      })
    );
    return results;
  },
};

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocument(filePath) {
  
  // delete all previous vectors (optional - skip if index is empty)
  try {
    await pineconeIndex.deleteAll();
    console.log("Previous vectors deleted");
  } catch (error) {
    console.log("No previous vectors to delete or index empty:", error.message);
  }

    // Fetch the PDF file from Cloudinary
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();

    // Convert to Blob (works with PDFLoader in serverless env)
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  
  const loader = new PDFLoader(blob, { splitPages: false });
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await textSplitter.splitText(docs[0].pageContent);

  const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: docs[0].metadata,
  }));

  await vectorStore.addDocuments(documents);

  console.log("✅ Document indexed successfully!");
}