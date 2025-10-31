import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs"; // ensure Node runtime for Buffer

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "agazian";
    if (!file) return NextResponse.json({ message: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(buffer);
    });

    return NextResponse.json({ message: "Uploaded", url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    if (!publicId) return NextResponse.json({ message: "publicId is required" }, { status: 400 });
    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ message: "Deleted", result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
