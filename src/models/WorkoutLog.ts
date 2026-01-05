import { Schema, models, model } from "mongoose";

const WorkoutLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ ключ за деня (00:00 UTC) - за "една тренировка на ден"
    dayKey: {
      type: Date,
      required: true,
      index: true,
    },

    day: {
      type: String,
      required: true,
    },

    focus: {
      type: String,
      required: true,
    },

    minutes: {
      type: Number,
      default: 0,
    },

    caloriesOut: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ уникално: 1 лог на ден за user
WorkoutLogSchema.index({ userId: 1, dayKey: 1 }, { unique: true });

export default models.WorkoutLog || model("WorkoutLog", WorkoutLogSchema);
