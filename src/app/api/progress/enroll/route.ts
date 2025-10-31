import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { verifyAuth } from "@/middleware/auth";
import UserProgress from "@/models/UserProgress";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ message: "courseId is required" }, { status: 400 });

    let progress = await UserProgress.findOne({ userId: user._id, courseId });
    if (!progress) {
      progress = await UserProgress.create({ userId: user._id, courseId, points: 0, completedModules: [] });
    }
    return NextResponse.json({ message: "Enrolled", progress });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
