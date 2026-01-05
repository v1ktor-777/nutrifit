export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import Food from "@/models/Food";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawId = (await params)?.id;
  if (!rawId || !mongoose.isValidObjectId(rawId)) {
    return Response.json({ error: `Invalid id: "${rawId}"` }, { status: 400 });
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
  const _id = toObjId(rawId);

  const updated = await Food.findOneAndUpdate(
    { _id, userId },
    {
      $set: {
        calories,
        protein: Number.isFinite(protein) ? protein : 0,
        carbs: Number.isFinite(carbs) ? carbs : 0,
        fat: Number.isFinite(fat) ? fat : 0,
      },
    },
    { new: true }
  ).lean();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true, item: normalizeFood(updated) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawId = (await params)?.id;
  if (!rawId || !mongoose.isValidObjectId(rawId)) {
    return Response.json({ error: `Invalid id: "${rawId}"` }, { status: 400 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);
  const _id = toObjId(rawId);

  const deleted = await Food.findOneAndDelete({ _id, userId }).lean();
  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
