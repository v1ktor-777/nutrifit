import mongoose, { Schema } from "mongoose";

const WorkoutPlanLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    day: { type: String, required: true },
    focus: { type: String, required: true },

    exercises: [
      {
        name: String,
        plannedSets: Number,
        plannedReps: String,
        completed: { type: Boolean, default: false },
      },
    ],

    completedAt: { type: Date },
  },
  { timestamps: true }
);

const MODEL_NAME = "WorkoutPlanLog";
if (process.env.NODE_ENV !== "production" && mongoose.models[MODEL_NAME]) {
  delete mongoose.models[MODEL_NAME];
}

export default mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, WorkoutPlanLogSchema);
