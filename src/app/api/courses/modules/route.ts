import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Module from "@/models/Module";

interface Params {
  courseId: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ message: "courseId is required" }, { status: 400 });

    const modules = await Module.find({ courseId }).sort({ order: 1 });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Fetch modules error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
