import mongoose, { Schema, Document, models } from "mongoose";

export interface IModule extends Document {
  titleEn: string;
  titleAm: string;
  contentEn: string; // lecture text in English
  contentAm: string; // lecture text in Amharic
  videoUrl?: string; // optional embedded YouTube link
  courseId: mongoose.Schema.Types.ObjectId; // reference to Course
  order: number; // for sorting modules inside a course
}

const ModuleSchema: Schema = new Schema(
  {
    titleEn: { type: String, required: true },
    titleAm: { type: String, required: true },
    contentEn: { type: String, required: true },
    contentAm: { type: String, required: true },
    videoUrl: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Clear cached model to force schema reload
if (models.Module) {
  delete models.Module;
}

const Module = mongoose.model<IModule>("Module", ModuleSchema);

export default Module;
