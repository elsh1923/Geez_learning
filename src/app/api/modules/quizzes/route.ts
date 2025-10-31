import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Quiz from "@/models/Quiz";

interface Params {
  moduleId: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    if (!moduleId) return NextResponse.json({ message: "moduleId is required" }, { status: 400 });

    const quizzes = await Quiz.find({ moduleId });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Fetch quizzes error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
