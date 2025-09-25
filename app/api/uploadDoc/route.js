/**
 * Implementation plan
 * Stage 1: Indexing
 * 1. Load the document ✅
 * 2. Chuck the document ✅
 * 3. Generate the vector embeddings ✅
 * 4. Store the vector embedding - Vector database ✅
 * 
 * Srage 2: Using the chatbot
 * 1. Setup LLM 
 * 2. Add retrieval step
 * 3. Pass input + relevant information to LLM
 * 4. Congratulations:
 */

import { indexTheDocument } from "../prepareDoc.js";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use /tmp instead of project folder
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join("/tmp", filename);

    // Write file to /tmp (works on Vercel serverless functions)
    await writeFile(filepath, buffer);

    // Process PDF immediately
    await indexTheDocument(filepath);

    return NextResponse.json({
      message: "File uploaded and processed successfully",
      filename,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}