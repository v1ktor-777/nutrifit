export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { requireUser, toApiError } from "@/lib/requireUser";
import { computeGoalMetrics, getRecommendedWeeklyRate, GOAL_STRATEGIES_BY_TYPE, type GoalStrategy, type GoalType } from "@/lib/goal";
import { isoDay, startOfDayUTC } from "@/lib/datetime";
import User from "@/models/User";
import BodyStat from "@/models/BodyStat";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

async function getLatestWeightKg(userId: string) {
  const latest = await BodyStat.findOne({ userId: toObjId(userId) })
    .sort({ date: -1 })
    .lean();
  return latest?.weight ?? null;
}

function serializeGoal(user: any, currentWeightKg: number | null) {
  const targetDate =
    user.targetDate && Number.isFinite(new Date(user.targetDate).getTime())
      ? new Date(user.targetDate)
      : null;

  const goalType = user.goalType ?? "maintain";
  const strategy = user.strategy ?? "maintain";

  const metrics = computeGoalMetrics({
    goalType,
    startWeightKg: user.startWeightKg ?? null,
    currentWeightKg,
    targetWeightKg: user.targetWeightKg ?? null,
    targetDate,
  });

  return {
    goalType,
    targetWeightKg: user.targetWeightKg ?? null,
    startWeightKg: user.startWeightKg ?? null,
    targetDate: targetDate ? isoDay(targetDate) : null,
    strategy,
    weeklyRateKg: user.weeklyRateKg ?? null,
    createdAtGoal: user.createdAtGoal ? new Date(user.createdAtGoal).toISOString() : null,
    updatedAtGoal: user.updatedAtGoal ? new Date(user.updatedAtGoal).toISOString() : null,
    currentWeightKg,
    ...metrics,
  };
}

export async function GET() {
  try {
    const { userId } = await requireUser();
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
      return Response.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const currentWeightKg = await getLatestWeightKg(userId);

    return Response.json({
      ok: true,
      data: serializeGoal(user, currentWeightKg),
    });
  } catch (err) {
    return toApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await requireUser();
    const body = await req.json();

    const goalType = body?.goalType as GoalType;
    const validGoalTypes: GoalType[] = ["gain", "lose", "maintain"];
    if (!validGoalTypes.includes(goalType)) {
      throw Object.assign(new Error("Invalid goalType"), { status: 400 });
    }

    const targetWeightRaw = body?.targetWeightKg;
    const parsedWeight =
      targetWeightRaw === null || targetWeightRaw === undefined || targetWeightRaw === ""
        ? null
        : Number(targetWeightRaw);
    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      throw Object.assign(new Error("Invalid targetWeightKg"), { status: 400 });
    }

    const targetDateRaw = body?.targetDate;
    let targetDate: Date | null = null;
    if (targetDateRaw) {
      const parsed = new Date(targetDateRaw);
      if (!Number.isFinite(parsed.getTime())) {
        throw Object.assign(new Error("Invalid targetDate"), { status: 400 });
      }
      const today = startOfDayUTC(new Date());
      const targetDay = startOfDayUTC(parsed);
      if (targetDay.getTime() < today.getTime()) {
        throw Object.assign(new Error("targetDate must be today or later"), {
          status: 400,
        });
      }
      targetDate = targetDay;
    }

    let strategy = body?.strategy as GoalStrategy | undefined;
    if (goalType === "maintain") {
      strategy = "maintain";
    }

    const allowedStrategies = GOAL_STRATEGIES_BY_TYPE[goalType];
    if (!strategy || !allowedStrategies.includes(strategy)) {
      throw Object.assign(new Error("Invalid strategy"), { status: 400 });
    }

    let targetWeightKg = parsedWeight;
    if (goalType === "maintain") {
      targetWeightKg = null;
      targetDate = null;
    } else if (targetWeightKg === null) {
      throw Object.assign(new Error("targetWeightKg is required"), { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const currentWeightKg = await getLatestWeightKg(userId);
    const startWeightKg =
      user.startWeightKg == null ? currentWeightKg : user.startWeightKg;

    const weeklyRateKg =
      strategy === "maintain" ? null : getRecommendedWeeklyRate(strategy);

    const now = new Date();
    user.goalType = goalType;
    user.targetWeightKg = targetWeightKg;
    user.targetDate = targetDate;
    user.strategy = strategy;
    user.weeklyRateKg = weeklyRateKg;
    user.startWeightKg = startWeightKg;
    user.createdAtGoal = user.createdAtGoal ?? now;
    user.updatedAtGoal = now;

    await user.save();

    return Response.json({
      ok: true,
      data: serializeGoal(user, currentWeightKg),
    });
  } catch (err) {
    return toApiError(err);
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireUser();
    await connectDB();

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          goalType: "maintain",
          targetWeightKg: null,
          startWeightKg: null,
          targetDate: null,
          strategy: "maintain",
          weeklyRateKg: null,
          createdAtGoal: null,
          updatedAtGoal: null,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return Response.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const currentWeightKg = await getLatestWeightKg(userId);

    return Response.json({
      ok: true,
      data: serializeGoal(updated, currentWeightKg),
    });
  } catch (err) {
    return toApiError(err);
  }
}
