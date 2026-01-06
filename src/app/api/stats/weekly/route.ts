import { NextResponse } from "next/server";
import { requireUser, toApiError } from "@/lib/requireUser";
import { connectDB } from "@/lib/db/mongodb";
import Food from "@/models/Food";
import Workout from "@/models/Workout";
import { startOfDayUTC, addDaysUTC, isoDay } from "@/lib/datetime";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { userId } = await requireUser();
    await connectDB();

    const today = startOfDayUTC(new Date());
    const start = addDaysUTC(today, -6); // 7 дни назад
    const end = addDaysUTC(today, 1);    // exclusive

    // --- FOOD AGG ---
    const foodAgg = await Food.aggregate([
      { $match: {
        userId: new ObjectId(userId),
        dayKey: { $gte: start, $lt: end }
      } },
      {
        $group: {
          _id: "$dayKey",
          caloriesIn: { $sum: "$calories" },
        },
      },
    ]);

    // --- WORKOUT AGG ---
    const workoutAgg = await Workout.aggregate([
      { $match: {
        userId: new ObjectId(userId),
        dayKey: { $gte: start, $lt: end }
      } },
      {
        $group: {
          _id: "$dayKey",
          caloriesOut: { $sum: "$calories" },
          minutes: { $sum: "$duration" },
        },
      },
    ]);
    console.log('foodAgg', foodAgg);

    // --- MAP by day ---
    const map: Record<string, any> = {};

    for (let i = 0; i < 7; i++) {
      const day = addDaysUTC(start, i);
      const key = isoDay(day);

      map[key] = {
        date: key,
        caloriesIn: 0,
        caloriesOut: 0,
        minutes: 0,
        net: 0,
      };
    }

    for (const f of foodAgg) {
      const key = isoDay(f._id);
      map[key].caloriesIn = f.caloriesIn;
    }

    for (const w of workoutAgg) {
      const key = isoDay(w._id);
      map[key].caloriesOut = w.caloriesOut;
      map[key].minutes = w.minutes;
    }

    const result = Object.values(map).map((d: any) => ({
      ...d,
      net: d.caloriesIn - d.caloriesOut,
    }));

    return NextResponse.json({
      ok: true,
      range: { start, endExclusive: end },
      data: result,
    });
  } catch (err) {
    return toApiError(err);
  }
}
