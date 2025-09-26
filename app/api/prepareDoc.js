import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import fetch from "node-fetch"; // for server-side fetch

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2", // free, small & fast
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index("company-bot");

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