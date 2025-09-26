import { indexTheDocument } from "../prepareDoc.js";
import { NextResponse } from "next/server";
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes); 

  //  Upload to Cloudinary
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