import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY, // add in your .env
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index("company-bot");

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocument(filePath) {
  // delete all previous vectors
  await pineconeIndex.delete({
    deleteAll: true,
  });

  const loader = new PDFLoader(filePath, { splitPages: false });
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