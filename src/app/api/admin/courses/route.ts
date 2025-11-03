import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";
import Module from "@/models/Module";
import Quiz from "@/models/Quiz";
import { verifyAuth } from "@/middleware/auth";
import { v2 as cloudinary } from "cloudinary";

interface Params {
  courseId?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { titleEn, titleAm, descriptionEn, descriptionAm, thumbnailUrl, thumbnailPublicId } = await req.json();

    if (!titleEn || !titleAm || !descriptionEn || !descriptionAm) {
      return NextResponse.json({ message: "Title and description in both languages are required" }, { status: 400 });
    }

    const course = await Course.create({
      titleEn,
      titleAm,
      descriptionEn,
      descriptionAm,
      thumbnail: thumbnailUrl || "",
      thumbnailPublicId: thumbnailPublicId || "",
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Course created successfully", course }, { status: 201 });
  } catch (error: any) {
    console.error("Create course error:", error);
    
    // Handle old 'title' index error (from previous schema version)
    if (error.code === 11000 && error.keyPattern?.title) {
      try {
        // Attempt to drop the old index
        await Course.collection.dropIndex("title_1");
        // Retry course creation
        const course = await Course.create({
          titleEn,
          titleAm,
          descriptionEn,
          descriptionAm,
          thumbnail: thumbnailUrl || "",
          thumbnailPublicId: thumbnailPublicId || "",
          createdBy: user._id,
        });
        return NextResponse.json({ message: "Course created successfully", course }, { status: 201 });
      } catch (retryError: any) {
        // If dropping index fails, provide helpful error message
        return NextResponse.json({ 
          message: "Database index error. Please drop the old 'title_1' index from the courses collection manually: db.courses.dropIndex('title_1')",
          error: retryError.message 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || undefined;
    if (!courseId) return NextResponse.json({ message: "Course ID is required" }, { status: 400 });

    const { titleEn, titleAm, descriptionEn, descriptionAm, thumbnailUrl, thumbnailPublicId } = await req.json();

    const updateData: any = { thumbnail: thumbnailUrl || "", thumbnailPublicId: thumbnailPublicId || "" };
    if (titleEn) updateData.titleEn = titleEn;
    if (titleAm) updateData.titleAm = titleAm;
    if (descriptionEn) updateData.descriptionEn = descriptionEn;
    if (descriptionAm) updateData.descriptionAm = descriptionAm;

    const course = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    );

    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    return NextResponse.json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Update course error:", error);
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
    const courseId = searchParams.get("courseId") || undefined;
    if (!courseId) return NextResponse.json({ message: "Course ID is required" }, { status: 400 });

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    // Find all modules for this course
    const modules = await Module.find({ courseId });
    const moduleIds = modules.map(m => m._id);

    // Delete all quizzes for these modules
    if (moduleIds.length > 0) {
      await Quiz.deleteMany({ moduleId: { $in: moduleIds } });
    }

    // Delete all modules for this course
    await Module.deleteMany({ courseId });

    // Delete all user progress records associated with this course
    await UserProgress.deleteMany({ courseId });

    // Best-effort delete thumbnail from Cloudinary if we have a publicId
    const publicId = (course as any).thumbnailPublicId;
    if (publicId) {
      try { await cloudinary.uploader.destroy(publicId); } catch {}
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
