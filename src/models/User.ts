import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Clear cached model to force schema reload
if (models.User) {
  delete models.User;
}

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
