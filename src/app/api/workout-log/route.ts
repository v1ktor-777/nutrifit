export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import WorkoutLog from "@/models/WorkoutLog";
import { startOfDayUTC, addDaysUTC, isoDay } from "@/lib/datetime";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function parseDayKey(dateLike: any) {
  // dateLike може да е: "YYYY-MM-DD", ISO string, Date, number
  if (!dateLike) return startOfDayUTC(new Date());
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return startOfDayUTC(new Date());
  return startOfDayUTC(d);
}

function normalizeLog(log: any) {
  return {
    _id: String(log._id),
    dayKey: log.dayKey,
    dayKeyIso: isoDay(new Date(log.dayKey)),
    day: log.day,
    focus: log.focus,
    minutes: log.minutes ?? 0,
    caloriesOut: log.caloriesOut ?? 0,
    completedAt: log.completedAt ?? null,
    createdAt: log.createdAt,
  };
}

/**
 * GET:
 * - /api/workout-log            -> връща log за днес
 * - /api/workout-log?date=YYYY-MM-DD -> връща log за тази дата
 * - /api/workout-log?days=30    -> връща масив dates за последните N дни
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = toObjId(session.user.id);

  const url = new URL(req.url);

  // ✅ list of dates for dashboard
  const daysParam = url.searchParams.get("days");
  if (daysParam) {
    const daysNum = Number(daysParam);
    const days = Number.isFinite(daysNum)
      ? Math.min(Math.max(daysNum, 1), 365)
      : 30;

    const today = startOfDayUTC(new Date());
    const from = addDaysUTC(today, -(days - 1));
    const to = addDaysUTC(today, 1);

    const docs = await WorkoutLog.find(
      { userId, dayKey: { $gte: from, $lt: to } },
      { dayKey: 1, _id: 0 }
    )
      .sort({ dayKey: 1 })
      .lean();

    const dates = docs.map((x: any) => isoDay(new Date(x.dayKey)));
    return Response.json({ days, dates });
  }

  // ✅ single day log
  const dateParam = url.searchParams.get("date");
  const targetDayKey = parseDayKey(dateParam);

  const nextDay = addDaysUTC(targetDayKey, 1);

  const log = await WorkoutLog.findOne({
    userId,
    dayKey: { $gte: targetDayKey, $lt: nextDay },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!log) return Response.json({ data: null });

  return Response.json({ data: normalizeLog(log) });
}

/**
 * POST:
 * body: { day, focus, minutes?, caloriesOut?, date? }
 * - date ако липсва -> днес
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { day, focus, minutes = 0, caloriesOut = 0, date } = body ?? {};

  if (!day || !focus) {
    return Response.json(
      { error: "day and focus are required" },
      { status: 400 }
    );
  }

  await connectDB();
  const userId = toObjId(session.user.id);

  const targetDayKey = parseDayKey(date);

  const saved = await WorkoutLog.findOneAndUpdate(
    { userId, dayKey: targetDayKey },
    {
      $set: {
        day,
        focus,
        minutes: Number(minutes) || 0,
        caloriesOut: Number(caloriesOut) || 0,
        completedAt: new Date(),
      },
      $setOnInsert: { userId, dayKey: targetDayKey },
    },
    { upsert: true, new: true }
  ).lean();

  return Response.json({ ok: true, data: normalizeLog(saved) });
}

/**
 * DELETE:
 * - /api/workout-log            -> трие днес
 * - /api/workout-log?date=YYYY-MM-DD -> трие тази дата
 * (не разчитаме на body при DELETE)
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = toObjId(session.user.id);

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const targetDayKey = parseDayKey(dateParam);

  await WorkoutLog.deleteOne({ userId, dayKey: targetDayKey });

  return Response.json({ ok: true });
}
