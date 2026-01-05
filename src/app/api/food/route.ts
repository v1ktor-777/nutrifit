export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import Food from "@/models/Food";
import { startOfDayUTC, addDaysUTC } from "@/lib/datetime";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function normalizeFood(doc: any) {
  return {
    _id: String(doc._id),
    calories: doc.calories ?? 0,
    protein: doc.protein ?? 0,
    carbs: doc.carbs ?? 0,
    fat: doc.fat ?? 0,
    date: doc.date ?? doc.createdAt,
    dayKey: doc.dayKey,
    createdAt: doc.createdAt,
  };
}

/* =========================
   GET – последни записи (примерно 10)
   ========================= */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);

  const items = await Food.find({ userId })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  return Response.json({ items: items.map(normalizeFood) });
}

/* =========================
   POST – създава запис (калории + макроси)
   ========================= */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const calories = Number(body?.calories);
  const protein = Number(body?.protein ?? 0);
  const carbs = Number(body?.carbs ?? 0);
  const fat = Number(body?.fat ?? 0);

  if (!Number.isFinite(calories) || calories <= 0) {
    return Response.json({ error: "Calories must be > 0" }, { status: 400 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);

  const now = new Date();
  const dayKey = startOfDayUTC(now);

  const created = await Food.create({
    userId,
    date: now,
    dayKey,
    calories,
    protein: Number.isFinite(protein) ? protein : 0,
    carbs: Number.isFinite(carbs) ? carbs : 0,
    fat: Number.isFinite(fat) ? fat : 0,
  });

  const lean = await Food.findById(created._id).lean();

  return Response.json({ ok: true, item: normalizeFood(lean) }, { status: 201 });
}
