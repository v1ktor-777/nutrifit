import { startOfDayUTC } from "@/lib/datetime";

export type GoalType = "gain" | "lose" | "maintain";
export type GoalStrategy = "lean_bulk" | "dirty_bulk" | "cut" | "recomp" | "maintain";

export const GOAL_STRATEGIES_BY_TYPE: Record<GoalType, GoalStrategy[]> = {
  gain: ["lean_bulk", "dirty_bulk", "recomp"],
  lose: ["cut", "recomp"],
  maintain: ["maintain"],
};

export type RecommendedRange = {
  min: number;
  max: number;
};

export function getRecommendedWeeklyRange(
  strategy: GoalStrategy
): RecommendedRange | null {
  switch (strategy) {
    case "lean_bulk":
      return { min: 0.25, max: 0.5 };
    case "dirty_bulk":
      return { min: 0.5, max: 1 };
    case "cut":
      return { min: 0.25, max: 1 };
    case "recomp":
      return { min: 0, max: 0.25 };
    case "maintain":
      return { min: 0, max: 0 };
    default:
      return null;
  }
}

export function getRecommendedWeeklyRate(strategy: GoalStrategy) {
  const range = getRecommendedWeeklyRange(strategy);
  if (!range) return null;
  return Number(((range.min + range.max) / 2).toFixed(2));
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function diffDaysUTC(from: Date, to: Date) {
  const start = startOfDayUTC(from);
  const end = startOfDayUTC(to);
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function computeGoalMetrics(input: {
  goalType: GoalType;
  startWeightKg: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  targetDate: Date | null;
  today?: Date;
}) {
  const {
    goalType,
    startWeightKg,
    currentWeightKg,
    targetWeightKg,
    targetDate,
    today = new Date(),
  } = input;

  let progress: number | null = null;

  if (goalType === "maintain") {
    progress = 1;
  } else if (
    startWeightKg != null &&
    currentWeightKg != null &&
    targetWeightKg != null
  ) {
    const denom = goalType === "gain"
      ? targetWeightKg - startWeightKg
      : startWeightKg - targetWeightKg;
    if (denom !== 0) {
      const num = goalType === "gain"
        ? currentWeightKg - startWeightKg
        : startWeightKg - currentWeightKg;
      progress = clamp01(num / denom);
    } else {
      progress = 0;
    }
  }

  const progressPercent = progress == null ? null : Math.round(progress * 100);

  const daysLeft =
    targetDate && Number.isFinite(targetDate.getTime())
      ? Math.max(0, diffDaysUTC(today, targetDate))
      : null;

  const monthsLeft =
    daysLeft == null ? null : Number((daysLeft / 30).toFixed(1));

  let requiredWeeklyRateKg: number | null = null;
  if (
    daysLeft != null &&
    daysLeft > 0 &&
    currentWeightKg != null &&
    targetWeightKg != null
  ) {
    requiredWeeklyRateKg = (targetWeightKg - currentWeightKg) / (daysLeft / 7);
    if (!Number.isFinite(requiredWeeklyRateKg)) {
      requiredWeeklyRateKg = null;
    }
  }

  return { progressPercent, daysLeft, monthsLeft, requiredWeeklyRateKg };
}
