import mongoose, { Schema, models, model } from "mongoose";

const WorkoutSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true },

    duration: { type: Number, required: true }, // минути
    calories: { type: Number, required: true },

    date: { type: Date, default: Date.now },     // реалният timestamp
    dayKey: { type: Date, required: true, index: true }, // 00:00 UTC
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, dayKey: 1 });

export default models.Workout || model("Workout", WorkoutSchema);
