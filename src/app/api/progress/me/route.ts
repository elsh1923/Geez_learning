import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { verifyAuth } from "@/middleware/auth";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const progress = await UserProgress.find({ userId: user._id });

    // Populate course titles and filter out progress for deleted courses
    const progressWithTitles = await Promise.all(
      progress.map(async (p) => {
        const course = await Course.findById(p.courseId);
        // If course doesn't exist, return null to filter it out
        if (!course) return null;
        return {
          ...p.toObject(),
          courseTitleEn: course.titleEn || null,
          courseTitleAm: course.titleAm || null,
        };
      })
    );

    // Filter out null entries (deleted courses) and delete their progress records
    const validProgress = progressWithTitles.filter(p => p !== null);
    const deletedCourseIds = progress
      .filter((p, idx) => progressWithTitles[idx] === null)
      .map(p => p._id);

    // Clean up progress records for deleted courses
    if (deletedCourseIds.length > 0) {
      await UserProgress.deleteMany({ _id: { $in: deletedCourseIds } });
    }

    return NextResponse.json({ progress: validProgress });
  } catch (error) {
    console.error("Fetch user progress error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export {};