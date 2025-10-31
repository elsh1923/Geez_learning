import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Quiz from "@/models/Quiz";
import Module from "@/models/Module";
import { verifyAuth } from "@/middleware/auth";

interface Params {
  quizId?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { moduleId, questionEn, questionAm, optionsEn, optionsAm, correctAnswer } = await req.json();

    if (!moduleId || !questionEn || !questionAm || !optionsEn || !optionsAm || !correctAnswer) {
      return NextResponse.json(
        { message: "moduleId, questionEn, questionAm, optionsEn, optionsAm, and correctAnswer are required" },
        { status: 400 }
      );
    }

    // Validate options arrays
    if (!Array.isArray(optionsEn) || !Array.isArray(optionsAm) || optionsEn.length < 2 || optionsAm.length < 2) {
      return NextResponse.json(
        { message: "At least two options are required in both languages" },
        { status: 400 }
      );
    }

    const module = await Module.findById(moduleId);
    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    const quiz = await Quiz.create({
      moduleId,
      questionEn,
      questionAm,
      optionsEn,
      optionsAm,
      correctAnswer,
    });

    return NextResponse.json({ message: "Quiz created successfully", quiz }, { status: 201 });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    if (!quizId) return NextResponse.json({ message: "Quiz ID is required" }, { status: 400 });

    const { questionEn, questionAm, optionsEn, optionsAm, correctAnswer } = await req.json();
    const updateData: any = { correctAnswer };
    if (questionEn) updateData.questionEn = questionEn;
    if (questionAm) updateData.questionAm = questionAm;
    if (optionsEn) updateData.optionsEn = optionsEn;
    if (optionsAm) updateData.optionsAm = optionsAm;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true }
    );

    if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

    return NextResponse.json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error("Update quiz error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    if (!quizId) return NextResponse.json({ message: "Quiz ID is required" }, { status: 400 });

    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
