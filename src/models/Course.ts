import mongoose, { Schema, Document, models } from "mongoose";

export interface ICourse extends Document {
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  thumbnail?: string;
  thumbnailPublicId?: string;
  createdBy: string; // admin ID
}

const CourseSchema: Schema = new Schema(
  {
    titleEn: { type: String, required: true },
    titleAm: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAm: { type: String, required: true },
    thumbnail: { type: String }, // optional image URL
    thumbnailPublicId: { type: String },
    createdBy: { type: String, required: true }, // admin's userId
  },
  { timestamps: true }
);

// Clear cached model to force schema reload
if (models.Course) {
  delete models.Course;
}

const Course = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
