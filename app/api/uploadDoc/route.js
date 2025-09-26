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
import { writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Delete all existing files in upload folder
    // const uploadDir = path.join(process.cwd(), 'upload');
    // try {
    //   const existingFiles = await readdir(uploadDir);
    //   for (const existingFile of existingFiles) {
    //     await unlink(path.join(uploadDir, existingFile));
    //   }
    // } catch (error) {
    //   // Upload folder might not exist, ignore error
    // }

    // // Convert to buffer
    // const bytes = await file.arrayBuffer();
    // const buffer = Buffer.from(bytes);

    // // Save to upload folder
    // const filename = `${Date.now()}_${file.name}`;
    // const filepath = path.join(uploadDir, filename);

    // // Write file to upload folder
    // await writeFile(filepath, buffer);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes); 

   
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${buffer.toString("base64")}`,
      {
        resource_type: "raw",   // since it's PDF
        folder: "pdf_uploads",  // optional folder
      }
    );

    // return NextResponse.json({ url: result.secure_url });
    console.log(result.secure_url )
  

    // Process PDF immediately
    await indexTheDocument(result.secure_url);

    return NextResponse.json({
      message: "File uploaded and processed successfully",
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}