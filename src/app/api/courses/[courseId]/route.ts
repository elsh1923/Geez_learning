import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Course from "@/models/Course";

export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const { courseId } = await params;
    if (!courseId) return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });
    return NextResponse.json({ course });
  } catch (error) {
    console.error("Fetch course error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
