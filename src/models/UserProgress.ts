import mongoose, { Schema, Document, models } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  points: number;
  level: number;
  badges: string[];
  completedModules: mongoose.Types.ObjectId[];
  courseCompleted?: boolean;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: false },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    completedModules: [{ type: Schema.Types.ObjectId, ref: "Module" }],
    courseCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Clear cached model to force schema reload
if (models.UserProgress) {
  delete models.UserProgress;
}

const UserProgress = mongoose.model<IUserProgress>("UserProgress", userProgressSchema);

export default UserProgress;
