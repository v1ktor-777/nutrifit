export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import WorkoutLog from "@/models/WorkoutLog";
import { startOfDayUTC, addDaysUTC } from "@/lib/datetime";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

/* =========================
   GET – днешният workout log
   Връща: { data: null | {...} }
   ========================= */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);

  const today = startOfDayUTC(new Date());
  const tomorrow = addDaysUTC(today, 1);

  const log = await WorkoutLog.findOne({
    userId,
    dayKey: { $gte: today, $lt: tomorrow },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!log) {
    return Response.json({ data: null });
  }

  return Response.json({
    data: {
      _id: String(log._id),
      day: log.day,
      focus: log.focus,
      minutes: log.minutes ?? 0,
      caloriesOut: log.caloriesOut ?? 0,
      completedAt: log.completedAt ?? null,
      createdAt: log.createdAt,
    },
  });
}

/* =========================
   POST – записва/ъпдейтва днешния log (upsert)
   ========================= */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { day, focus, minutes = 0, caloriesOut = 0 } = body ?? {};

  if (!day || !focus) {
    return Response.json(
      { error: "day and focus are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const userId = toObjId(session.user.id);

  const today = startOfDayUTC(new Date());

  const saved = await WorkoutLog.findOneAndUpdate(
    { userId, dayKey: today },
    {
      $set: {
        day,
        focus,
        minutes: Number(minutes) || 0,
        caloriesOut: Number(caloriesOut) || 0,
        completedAt: new Date(),
      },
      $setOnInsert: { userId, dayKey: today },
    },
    { upsert: true, new: true }
  ).lean();

  return Response.json({
    ok: true,
    data: {
      _id: String(saved._id),
      day: saved.day,
      focus: saved.focus,
      minutes: saved.minutes ?? 0,
      caloriesOut: saved.caloriesOut ?? 0,
      completedAt: saved.completedAt ?? null,
      createdAt: saved.createdAt,
    },
  });
}


/* =========================
   DELETE – маха днешния log
   ========================= */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);
  const today = startOfDayUTC(new Date());

  await WorkoutLog.deleteOne({ userId, dayKey: today });

  return Response.json({ ok: true });
}
