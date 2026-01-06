export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import WorkoutLog from "@/models/WorkoutLog";
import { startOfDayUTC } from "@/lib/datetime";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function parseDayKey(dateLike: any) {
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${dateLike}`);
  return startOfDayUTC(d);
}

/**
 * POST /api/workout-log/bulk
 * body: { entries: [{ date, day, focus, minutes?, caloriesOut? }, ...] }
 * -> upsert по (userId + dayKey) за всеки entry
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const entries = body?.entries;

  if (!Array.isArray(entries) || entries.length === 0) {
    return Response.json({ error: "entries[] required" }, { status: 400 });
  }

  await connectDB();
  const userId = toObjId(session.user.id);

  const ops = entries.map((e: any) => {
    if (!e?.date || !e?.day || !e?.focus) {
      throw new Error("Each entry needs date, day, focus");
    }

    const dayKey = parseDayKey(e.date);

    return {
      updateOne: {
        filter: { userId, dayKey },
        update: {
          $set: {
            day: e.day,
            focus: e.focus,
            minutes: Number(e.minutes) || 0,
            caloriesOut: Number(e.caloriesOut) || 0,
            completedAt: new Date(),
          },
          $setOnInsert: { userId, dayKey },
        },
        upsert: true,
      },
    };
  });

  const result = await WorkoutLog.bulkWrite(ops, { ordered: false });

  return Response.json({
    ok: true,
    matched: result.matchedCount ?? 0,
    modified: result.modifiedCount ?? 0,
    upserted: result.upsertedCount ?? 0,
  });
}
