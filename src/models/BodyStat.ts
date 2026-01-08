import mongoose, { Schema } from "mongoose";

const BodyStatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // реална дата (за показване)
    date: { type: Date, required: true },

    // ✅ ключ за деня (00:00 UTC) - 1 запис на ден
    dayKey: { type: Date, required: true, index: true },

    // ✅ задължително
    weight: { type: Number, required: true },

  },
  { timestamps: true }
);

// ✅ 1 запис на ден за user
BodyStatSchema.index({ userId: 1, dayKey: 1 }, { unique: true });
BodyStatSchema.index({ userId: 1, date: -1 });

// ✅ IMPORTANT: Next.js dev/HMR fix — гарантира, че schema update-ите се прилагат
const BodyStatModelName = "BodyStat";
const existingModel = mongoose.models[BodyStatModelName];

if (process.env.NODE_ENV !== "production" && existingModel) {
  delete mongoose.models[BodyStatModelName];
}

export default mongoose.models[BodyStatModelName] ||
  mongoose.model(BodyStatModelName, BodyStatSchema);
