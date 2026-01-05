import mongoose, { Schema, models, model } from "mongoose";

const ProgramSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    goal: {
      type: String,
      enum: ["cut", "bulk", "maintain"],
      required: true,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate"],
      required: true,
    },

    daysPerWeek: {
      type: Number,
      min: 3,
      max: 6,
      required: true,
    },

    equipment: {
      type: String,
      enum: ["gym", "home"],
      required: true,
    },

    // тренировъчният план
    plan: [
      {
        day: String,
        focus: String,
        exercises: [
          {
            name: String,
            sets: Number,
            reps: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default models.Program || model("Program", ProgramSchema);
