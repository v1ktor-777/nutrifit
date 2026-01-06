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

/**
 * GET /api/workout-log/dates?days=30
 * Връща масив от дати (YYYY-MM-DD) в които има завършена тренировка
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const daysParam = Number(url.searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 365) : 30;

  await connectDB();

  const userId = toObjId(session.user.id);

  const today = startOfDayUTC(new Date());
  const from = addDaysUTC(today, -(days - 1));
  const to = addDaysUTC(today, 1);

  const logs = await WorkoutLog.find(
    {
      userId,
      dayKey: { $gte: from, $lt: to },
      completedAt: { $ne: null },
    },
    { dayKey: 1, _id: 0 }
  )
    .sort({ dayKey: 1 })
    .lean();

  const dates = logs.map((x: any) => isoDay(new Date(x.dayKey)));

  return Response.json({ days, dates });
}
