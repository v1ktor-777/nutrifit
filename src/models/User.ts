import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    // ✅ Profile fields (set once, but can be edited)
    heightCm: { type: Number, default: null, min: 0 },
    sex: { type: String, default: null, enum: ["male", "female", null] },
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
