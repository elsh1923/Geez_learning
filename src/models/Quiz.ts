import mongoose, { Schema, Document, models } from "mongoose";

export interface IQuiz extends Document {
  moduleId: mongoose.Schema.Types.ObjectId; // Reference to Module
  questionEn: string;
  questionAm: string;
  optionsEn: string[]; // multiple-choice options in English
  optionsAm: string[]; // multiple-choice options in Amharic
  correctAnswer: string; // index (0, 1, 2, 3) or exact value that works for both
}

const QuizSchema: Schema = new Schema(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    questionEn: { type: String, required: true },
    questionAm: { type: String, required: true },
    optionsEn: { type: [String], required: true },
    optionsAm: { type: [String], required: true },
    correctAnswer: { type: String, required: true }, // index (0, 1, 2, 3) or exact value
  },
  { timestamps: true }
);

// Clear cached model to force schema reload
if (models.Quiz) {
  delete models.Quiz;
}

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
