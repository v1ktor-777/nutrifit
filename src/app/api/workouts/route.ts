import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Workout from "@/models/Workout";
import { requireUser, toApiError } from "@/lib/requireUser"; // при теб е requireUser.ts
import { startOfDayUTC } from "@/lib/datetime";
import { z } from "zod";

const WorkoutCreateSchema = z.object({
  title: z.string().trim().min(2).max(80),
  duration: z.number().int().min(1).max(600),
  calories: z.number().int().min(0).max(5000),
  date: z.coerce.date().optional(),
});

export async function GET() {
  try {
    const { userId } = await requireUser();
    await connectDB();

    const workouts = await Workout.find({ userId }).sort({ date: -1 });
    return NextResponse.json({ ok: true, data: workouts });
  } catch (err) {
    return toApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireUser();
    const body = await req.json();

    const data = WorkoutCreateSchema.parse(body);

    await connectDB();

    const date = data.date ?? new Date();
    const dayKey = startOfDayUTC(date);

    const workout = await Workout.create({
      userId,
      title: data.title,
      duration: data.duration,
      calories: data.calories,
      date,
      dayKey,
    });

    return NextResponse.json({ ok: true, data: workout }, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
