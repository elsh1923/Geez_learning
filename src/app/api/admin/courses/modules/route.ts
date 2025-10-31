import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Module from "@/models/Module";
import Course from "@/models/Course";
import { verifyAuth } from "@/middleware/auth";

interface Params {
  moduleId?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });

    const { titleEn, titleAm, contentEn, contentAm, videoUrl, courseId, order, thumbnailUrl } = await req.json();

    if (!titleEn || !titleAm || !contentEn || !contentAm || !courseId) {
      return NextResponse.json({ message: "Title, content in both languages, and courseId are required" }, { status: 400 });
    }

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    const module = await Module.create({
      titleEn,
      titleAm,
      contentEn,
      contentAm,
      videoUrl,
      courseId,
      order,
      thumbnail: thumbnailUrl || "", // save uploaded thumbnail URL
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Module created successfully", module }, { status: 201 });
  } catch (error) {
    console.error("Create module error:", error);
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
    const moduleId = searchParams.get("moduleId");
    if (!moduleId) return NextResponse.json({ message: "Module ID is required" }, { status: 400 });

    const { titleEn, titleAm, contentEn, contentAm, videoUrl, order, thumbnailUrl } = await req.json();
    const updateData: any = { videoUrl, order, thumbnail: thumbnailUrl || "" };
    if (titleEn) updateData.titleEn = titleEn;
    if (titleAm) updateData.titleAm = titleAm;
    if (contentEn) updateData.contentEn = contentEn;
    if (contentAm) updateData.contentAm = contentAm;

    const module = await Module.findByIdAndUpdate(
      moduleId,
      updateData,
      { new: true }
    );

    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    return NextResponse.json({ message: "Module updated successfully", module });
  } catch (error) {
    console.error("Update module error:", error);
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
    const moduleId = searchParams.get("moduleId");
    if (!moduleId) return NextResponse.json({ message: "Module ID is required" }, { status: 400 });

    const module = await Module.findByIdAndDelete(moduleId);
    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
