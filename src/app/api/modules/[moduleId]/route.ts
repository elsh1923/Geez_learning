import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Module from "@/models/Module";

export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const { moduleId } = await params;
    if (!moduleId) return NextResponse.json({ message: "Module ID is required" }, { status: 400 });
    const module = await Module.findById(moduleId);
    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });
    return NextResponse.json({ module });
  } catch (error) {
    console.error("Fetch module error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

