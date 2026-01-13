import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    // ✅ Profile fields (set once, but can be edited)
    heightCm: { type: Number, default: null, min: 0 },
    sex: { type: String, default: null, enum: ["male", "female", null] },

    goalType: {
      type: String,
      enum: ["gain", "lose", "maintain"],
      default: "maintain",
    },
    targetWeightKg: { type: Number, default: null, min: 0 },
    startWeightKg: { type: Number, default: null, min: 0 },
    targetDate: { type: Date, default: null },
    strategy: {
      type: String,
      enum: ["lean_bulk", "dirty_bulk", "cut", "recomp", "maintain"],
      default: "maintain",
    },
    weeklyRateKg: { type: Number, default: null, min: 0 },
    createdAtGoal: { type: Date, default: null },
    updatedAtGoal: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ HMR-safe
const ModelName = "User";
const existing = mongoose.models[ModelName];
if (process.env.NODE_ENV !== "production" && existing) {
  delete mongoose.models[ModelName];
}

export default mongoose.models[ModelName] || mongoose.model(ModelName, UserSchema);

