import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { verifyAuth } from "@/middleware/auth";
import User from "@/models/User";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";
import Module from "@/models/Module";
import Quiz from "@/models/Quiz";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    // Get statistics
    const [
      totalUsers,
      totalAdmins,
      totalCourses,
      totalModules,
      totalQuizzes,
      totalEnrollments,
      completedCourses,
      totalPoints,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Course.countDocuments(),
      Module.countDocuments(),
      Quiz.countDocuments(),
      UserProgress.countDocuments(),
      UserProgress.countDocuments({ courseCompleted: true }),
      UserProgress.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$points" },
          },
        },
      ]).then((result) => result[0]?.total || 0),
    ]);

    // Get enrollments per course
    const enrollmentsByCourse = await UserProgress.aggregate([
      {
        $group: {
          _id: "$courseId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Populate course titles for enrollments
    const enrollmentsWithCourseTitles = await Promise.all(
      enrollmentsByCourse.map(async (item) => {
        const course = await Course.findById(item._id).select("titleEn titleAm");
        return {
          courseId: item._id.toString(),
          courseTitleEn: course?.titleEn || "Unknown",
          courseTitleAm: course?.titleAm || "አይታወቅም",
          enrollments: item.count,
        };
      })
    );

    // Get recent users (last 10) - exclude admins
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role createdAt")
      .lean();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAdmins,
        totalCourses,
        totalModules,
        totalQuizzes,
        totalEnrollments,
        completedCourses,
        totalPoints,
        averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0,
      },
      topCourses: enrollmentsWithCourseTitles,
      recentUsers: recentUsers.map((u: any) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

