import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import Food from "@/models/Food";
import WorkoutLog from "@/models/WorkoutLog";
import { startOfDayUTC, addDaysUTC, isoDay } from "@/lib/datetime";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(session.user.id);

  const today = startOfDayUTC(new Date());
  const tomorrow = addDaysUTC(today, 1);
  const startWeek = addDaysUTC(today, -6);

  // ✅ Food totals today (calories + macros)
  const foodAgg = await Food.aggregate([
    { $match: { userId: userObjectId, dayKey: { $gte: today, $lt: tomorrow } } },
    {
      $group: {
        _id: null,
        calories: { $sum: "$calories" },
        protein: { $sum: "$protein" },
        carbs: { $sum: "$carbs" },
        fat: { $sum: "$fat" },
      },
    },
  ]);

  const todayTotals =
    foodAgg[0] ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // ✅ Workout checks (from WorkoutLog)
  const workoutToday = await WorkoutLog.exists({
    userId: userObjectId,
    dayKey: { $gte: today, $lt: tomorrow },
  });

  const workoutsThisWeek = await WorkoutLog.countDocuments({
    userId: userObjectId,
    dayKey: { $gte: startWeek, $lt: tomorrow },
  });

  // ✅ NEW: workout dates array (последни 30 дни)
  const start6 = addDaysUTC(today, -6); // inclusive (today included => 30 days)
  const workoutDaysDocs = await WorkoutLog.find(
    {
      userId: userObjectId,
      dayKey: { $gte: start6, $lt: tomorrow },
      completedAt: { $ne: null }, // само завършени (ако искаш всички, махни този ред)
    },
    { dayKey: 1, _id: 0 }
  )
    .sort({ dayKey: 1 })
    .lean();

  const workoutDates = workoutDaysDocs.map((x: any) =>
    isoDay(new Date(x.dayKey))
  );

  return Response.json({
    todayCalories: todayTotals.calories ?? 0,
    todayProtein: todayTotals.protein ?? 0,
    todayCarbs: todayTotals.carbs ?? 0,
    todayFat: todayTotals.fat ?? 0,
    workoutToday: Boolean(workoutToday),
    workoutsThisWeek,

    // ✅ NEW: масив с дати (YYYY-MM-DD) в които има тренировка
    workoutDates,
  });
}
