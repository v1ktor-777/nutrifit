import mongoose, { Schema } from "mongoose";

const FoodSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: { type: Date, required: true },
    dayKey: { type: Date, required: true, index: true },

    calories: { type: Number, required: true },

    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FoodSchema.index({ userId: 1, dayKey: 1 });
FoodSchema.index({ userId: 1, date: -1 });

// ✅ IMPORTANT: Next.js dev/HMR fix — гарантира, че schema update-ите се прилагат
const FoodModelName = "Food";
const existingModel = mongoose.models[FoodModelName];

if (process.env.NODE_ENV !== "production" && existingModel) {
  delete mongoose.models[FoodModelName];
}

export default mongoose.models[FoodModelName] ||
  mongoose.model(FoodModelName, FoodSchema);
