import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import UserProgress from "@/models/UserProgress";
import User from "@/models/User";

export {};

export async function GET() {
  try {
    await dbConnect();

    // Aggregate points by user
    const aggregated = await UserProgress.aggregate([
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$points" },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $limit: 100,
      },
    ]);

    // Populate user details
    const leaderboard = await Promise.all(
      aggregated.map(async (item) => {
        const user = await User.findById(item._id).select("name email");
        return {
          _id: item._id.toString(),
          userId: user ? { username: user.name, email: user.email } : { username: "Unknown", email: "" },
          points: item.totalPoints,
        };
      })
    );

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
