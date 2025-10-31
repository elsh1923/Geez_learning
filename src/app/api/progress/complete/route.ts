import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { verifyAuth } from "@/middleware/auth";
import UserProgress from "@/models/UserProgress";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { courseId, moduleId, quizId, pointsEarned } = await req.json();

    // Validate input
    if (!courseId || (!moduleId && !quizId) || typeof pointsEarned !== "number") {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // Find existing progress for this user & course
    let progress = await UserProgress.findOne({ userId: user._id, courseId });

    // Initialize progress if not found
    if (!progress) {
      progress = await UserProgress.create({
        userId: user._id,
        courseId,
        moduleId: moduleId || undefined,
        completedModules: moduleId ? [moduleId] : [],
        points: pointsEarned,
        level: Math.floor(pointsEarned / 100) + 1,
        badges: pointsEarned >= 500 ? ["Ge'ez Scholar"] : [],
      });
    } else {
      // Update points
      progress.points += pointsEarned;

      // Update completed modules
      if (moduleId && !progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId);
      }

      // Level calculation
      progress.level = Math.floor(progress.points / 100) + 1;

      // Badge unlock logic
      if (progress.points >= 500 && !progress.badges.includes("Ge’ez Scholar")) {
        progress.badges.push("Ge’ez Scholar");
      }
      if (progress.points >= 1000 && !progress.badges.includes("Master Linguist")) {
        progress.badges.push("Master Linguist");
      }

      await progress.save();
    }

    return NextResponse.json({ message: "Progress updated successfully", progress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
