import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Course from "@/models/Course";

export async function GET() {
  try {
    await dbConnect();

    const courses = await Course.find().sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
