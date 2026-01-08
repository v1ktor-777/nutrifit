export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import BodyStat from "@/models/BodyStat";
import { startOfDayUTC, addDaysUTC, isoDay } from "@/lib/datetime";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

/* =========================
   GET – последните N дни body stats
   /api/body-stats?days=7
   ========================= */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);

  const url = new URL(req.url);
  const daysParam = Number(url.searchParams.get("days") ?? 7);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 60) : 7;

  const today = startOfDayUTC(new Date());
  const start = addDaysUTC(today, -(days - 1));
  const tomorrow = addDaysUTC(today, 1);

  const items = await BodyStat.find({
    userId,
    dayKey: { $gte: start, $lt: tomorrow },
  })
    .sort({ dayKey: 1 })
    .lean();

  return Response.json({
    data: items.map((x: any) => ({
      _id: String(x._id),
      date: isoDay(new Date(x.dayKey)), // YYYY-MM-DD
      weight: x.weight,
      bodyFat: x.bodyFat ?? null,
      createdAt: x.createdAt,
    })),
  });
}

/* =========================
   POST – upsert за ден (default: днес)
   body: { weight, bodyFat?, date? }
   ========================= */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const weight = Number(body?.weight);
  const bodyFatRaw = body?.bodyFat;

  if (!Number.isFinite(weight) || weight <= 0) {
    return Response.json({ error: "weight is required" }, { status: 400 });
  }

  // ако подадеш date -> записва за него, иначе за днес
  const inputDate = body?.date ? new Date(body.date) : new Date();
  if (Number.isNaN(inputDate.getTime())) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  const bodyFat =
    bodyFatRaw === null || bodyFatRaw === undefined || bodyFatRaw === ""
      ? null
      : Number(bodyFatRaw);

  if (bodyFat !== null && (!Number.isFinite(bodyFat) || bodyFat < 0 || bodyFat > 100)) {
    return Response.json({ error: "Invalid bodyFat" }, { status: 400 });
  }

  await connectDB();

  const userId = toObjId(session.user.id);
  const dayKey = startOfDayUTC(inputDate);

  const saved = await BodyStat.findOneAndUpdate(
    { userId, dayKey },
    {
      $set: {
        date: inputDate,
        weight,
        bodyFat,
      },
      $setOnInsert: { userId, dayKey },
    },
    { upsert: true, new: true }
  ).lean();

  return Response.json({
    ok: true,
    data: {
      _id: String(saved._id),
      date: isoDay(new Date(saved.dayKey)),
      weight: saved.weight,
      bodyFat: saved.bodyFat ?? null,
      createdAt: saved.createdAt,
    },
  });
}
