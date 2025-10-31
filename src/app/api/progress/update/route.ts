import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { verifyAuth } from "@/middleware/auth";
import UserProgress from "@/models/UserProgress";
import Module from "@/models/Module";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify user authentication
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { courseId, moduleId, pointsEarned, markModuleComplete } = await req.json();

    if (!courseId || !moduleId || typeof pointsEarned !== "number") {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // Find existing progress for this user and course
    let progress = await UserProgress.findOne({ userId: user._id, courseId });

    // Check if module is already completed (to prevent duplicate points)
    const isModuleAlreadyCompleted = progress?.completedModules.some((id: any) => String(id) === String(moduleId));

    if (!progress) {
      // Create a new progress document if not exists
      progress = await UserProgress.create({
        userId: user._id,
        courseId,
        moduleId,
        points: markModuleComplete ? pointsEarned : 0, // Only award points if quiz is passed
        completedModules: markModuleComplete ? [moduleId] : [],
        courseCompleted: false,
      });
    } else {
      // Only award points if module is NOT already completed (first time passing)
      if (markModuleComplete && !isModuleAlreadyCompleted) {
        progress.points += pointsEarned;
      }

      // Only mark module as completed if all quiz answers were correct and not already completed
      if (markModuleComplete && !isModuleAlreadyCompleted) {
        progress.completedModules.push(moduleId);
      }

      // Level-up logic
      progress.level = Math.floor(progress.points / 100) + 1;

      // Badge unlock logic
      if (progress.points >= 500 && !progress.badges.includes("Ge'ez Scholar")) {
        progress.badges.push("Ge'ez Scholar");
      }
      if (progress.points >= 1000 && !progress.badges.includes("Master Linguist")) {
        progress.badges.push("Master Linguist");
      }

      await progress.save();
    }

    // Check if all modules in the course are completed
    const allModules = await Module.find({ courseId }).select("_id").lean();
    const allModuleIds = allModules.map((m: any) => String(m._id));
    const completedModuleIds = progress.completedModules.map((id: any) => String(id));

    // Check if all modules are completed
    const allCompleted = allModuleIds.length > 0 && allModuleIds.every(id => completedModuleIds.includes(id));

    if (allCompleted && !progress.courseCompleted) {
      progress.courseCompleted = true;
      await progress.save();
    }

    return NextResponse.json({
      message: "Progress updated successfully",
      progress,
      courseCompleted: progress.courseCompleted,
      alreadyCompleted: isModuleAlreadyCompleted || false,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
