"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { GOAL_STRATEGIES_BY_TYPE, getRecommendedWeeklyRange, type GoalStrategy, type GoalType } from "@/lib/goal";
import { logError, toUserError } from "@/lib/uiError";

type BodyStat = {
  _id: string;
  date: string;
  weight: number;
};

type ProfileData = {
  heightCm?: number | null;
  sex?: "male" | "female" | null;
};

type GoalData = {
  goalType: GoalType;
  strategy: GoalStrategy;
  targetWeightKg: number | null;
  startWeightKg: number | null;
  targetDate: string | null;
  weeklyRateKg: number | null;
  createdAtGoal: string | null;
  updatedAtGoal: string | null;
  currentWeightKg: number | null;
  monthsLeft: number | null;
  daysLeft: number | null;
  progressPercent: number | null;
  requiredWeeklyRateKg: number | null;
};

type GoalFormState = {
  goalType: GoalType;
  strategy: GoalStrategy;
  targetWeightKg: string;
  targetDate: string;
};

function calcBmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  if (h <= 0) return null;
  return weightKg / (h * h);
}

function formatMessage(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}

export default function ProgressPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<BodyStat[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goal, setGoal] = useState<GoalData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalOk, setGoalOk] = useState<string | null>(null);

  const [weight, setWeight] = useState<string>("");
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    goalType: "maintain",
    strategy: "maintain",
    targetWeightKg: "",
    targetDate: "",
  });

  const latest = useMemo(() => {
    if (!items.length) return null;
    return items[items.length - 1];
  }, [items]);

  const heightCm = profile?.heightCm ?? null;

  const latestBmi = useMemo(() => {
    if (!latest || !heightCm) return null;
    const bmi = calcBmi(latest.weight, heightCm);
    if (!bmi || !Number.isFinite(bmi)) return null;
    return bmi;
  }, [latest, heightCm]);

  const bmiLabel = (bmi: number) => {
    if (bmi < 18.5) return t("progress.bmiUnderweight");
    if (bmi < 25) return t("progress.bmiNormal");
    if (bmi < 30) return t("progress.bmiOverweight");
    return t("progress.bmiObesity");
  };

  const goalTypeLabels = useMemo(
    () => ({
      gain: t("goal.typeGain"),
      lose: t("goal.typeLose"),
      maintain: t("goal.typeMaintain"),
    }),
    [t]
  );

  const strategyLabels = useMemo(
    () => ({
      lean_bulk: t("goal.strategyLeanBulk"),
      dirty_bulk: t("goal.strategyDirtyBulk"),
      cut: t("goal.strategyCut"),
      recomp: t("goal.strategyRecomp"),
      maintain: t("goal.strategyMaintain"),
    }),
    [t]
  );

  async function load() {
    setError(null);
    setLoading(true);
    setGoalError(null);
    setGoalOk(null);

    try {
      const [statsRes, profileRes, goalRes] = await Promise.all([
        fetch("/api/body-stats?days=30"),
        fetch("/api/profile"),
        fetch("/api/goal"),
      ]);

      if (!statsRes.ok) {
        const txt = await statsRes.text().catch(() => "");
        logError("progress.load.stats", { status: statsRes.status, body: txt });
        setError(toUserError({ status: statsRes.status }, t));
        setItems([]);
      } else {
        const statsJson = await statsRes.json();
        setItems(statsJson?.data ?? []);
      }

      if (!profileRes.ok) {
        const txt = await profileRes.text().catch(() => "");
        logError("progress.load.profile", { status: profileRes.status, body: txt });
        setError(toUserError({ status: profileRes.status }, t));
        setProfile(null);
      } else {
        const profileJson = await profileRes.json();
        setProfile(profileJson?.data ?? null);
      }

      if (!goalRes.ok) {
        const txt = await goalRes.text().catch(() => "");
        logError("progress.load.goal", { status: goalRes.status, body: txt });
        setGoalError(toUserError({ status: goalRes.status }, t));
        setGoal(null);
      } else {
        const goalJson = await goalRes.json();
        setGoal(goalJson?.data ?? null);
      }
    } catch (e: unknown) {
      logError("progress.load", e);
      setError(toUserError(e, t));
      setItems([]);
      setProfile(null);
      setGoal(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!goal) return;
    setGoalForm({
      goalType: goal.goalType,
      strategy: goal.strategy,
      targetWeightKg: goal.targetWeightKg == null ? "" : String(goal.targetWeightKg),
      targetDate: goal.targetDate ?? "",
    });
  }, [goal]);

  async function submit() {
    setError(null);

    const w = Number(weight);

    if (!Number.isFinite(w) || w <= 0) {
      setError(t("progress.invalidWeight"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/body-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        logError("progress.submit", { status: res.status, body: txt });
        setError(toUserError({ status: res.status }, t));
        return;
      }

      setWeight("");
      await load();
    } catch (e: unknown) {
      logError("progress.submit", e);
      setError(toUserError(e, t));
    } finally {
      setSaving(false);
    }
  }

  const strategyOptions = GOAL_STRATEGIES_BY_TYPE[goalForm.goalType];

  const updateGoalType = (value: GoalType) => {
    const allowed = GOAL_STRATEGIES_BY_TYPE[value];
    setGoalForm((prev) => ({
      ...prev,
      goalType: value,
      strategy: allowed.includes(prev.strategy) ? prev.strategy : allowed[0],
      targetWeightKg: value === "maintain" ? "" : prev.targetWeightKg,
      targetDate: value === "maintain" ? "" : prev.targetDate,
    }));
  };

  const updateGoalStrategy = (value: GoalStrategy) => {
    setGoalForm((prev) => ({ ...prev, strategy: value }));
  };

  async function saveGoal() {
    setGoalError(null);
    setGoalOk(null);

    const targetWeightRaw = goalForm.targetWeightKg.trim();
    const targetWeightKg =
      targetWeightRaw === "" ? null : Number(goalForm.targetWeightKg);

    if (targetWeightKg !== null && (!Number.isFinite(targetWeightKg) || targetWeightKg < 0)) {
      setGoalError(t("goal.invalidTargetWeight"));
      return;
    }

    if (goalForm.goalType !== "maintain" && targetWeightKg === null) {
      setGoalError(t("goal.targetWeightRequired"));
      return;
    }

    let targetDate: string | null = goalForm.targetDate.trim() || null;
    if (targetDate) {
      const parsed = new Date(targetDate);
      const today = new Date();
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const targetDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      if (!Number.isFinite(parsed.getTime()) || targetDay < todayDay) {
        setGoalError(t("goal.invalidTargetDate"));
        return;
      }
    }

    setGoalSaving(true);
    try {
      const res = await fetch("/api/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType: goalForm.goalType,
          strategy: goalForm.strategy,
          targetWeightKg,
          targetDate,
        }),
      });

      const json = await res.json().catch((err) => {
        logError("goal.save.parse", err);
        return null;
      });

      if (!res.ok) {
        logError("goal.save", { status: res.status, body: json });
        setGoalError(toUserError({ status: res.status }, t));
        return;
      }

      setGoal(json?.data ?? null);
      setGoalOk(t("goal.saved"));
    } catch (e: unknown) {
      logError("goal.save", e);
      setGoalError(toUserError(e, t));
    } finally {
      setGoalSaving(false);
    }
  }

  async function resetGoal() {
    setGoalError(null);
    setGoalOk(null);
    setGoalSaving(true);

    try {
      const res = await fetch("/api/goal", { method: "DELETE" });
      const json = await res.json().catch((err) => {
        logError("goal.reset.parse", err);
        return null;
      });

      if (!res.ok) {
        logError("goal.reset", { status: res.status, body: json });
        setGoalError(toUserError({ status: res.status }, t));
        return;
      }

      setGoal(json?.data ?? null);
      setGoalOk(t("goal.resetDone"));
    } catch (e: unknown) {
      logError("goal.reset", e);
      setGoalError(toUserError(e, t));
    } finally {
      setGoalSaving(false);
    }
  }

  const selectedRange = getRecommendedWeeklyRange(goalForm.strategy);
  const goalRange = goal ? getRecommendedWeeklyRange(goal.strategy) : null;

  const progressPercent = goal?.progressPercent ?? (goal?.goalType === "maintain" ? 100 : 0);

  const remainingKg = useMemo(() => {
    if (!goal || goal.currentWeightKg == null || goal.targetWeightKg == null) return null;
    if (goal.goalType === "gain") {
      return Math.max(0, goal.targetWeightKg - goal.currentWeightKg);
    }
    if (goal.goalType === "lose") {
      return Math.max(0, goal.currentWeightKg - goal.targetWeightKg);
    }
    return 0;
  }, [goal]);

  const currentWeightKg = goal?.currentWeightKg ?? latest?.weight ?? null;

  if (loading) {
    return <p className="text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-10 w-full max-w-6xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("progress.title")}
        </h1>
        <p className="text-muted">{t("progress.subtitle")}</p>
      </header>

      {error && (
        <div className="card border border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("goal.title")}</h2>
            <p className="text-sm text-muted">{t("goal.subtitle")}</p>
          </div>
          {goal ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-1">
                {goalTypeLabels[goal.goalType]}
              </span>
              <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-1">
                {strategyLabels[goal.strategy]}
              </span>
            </div>
          ) : null}
        </div>

        {(goalError || goalOk) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              goalError
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-green-300 bg-green-50 text-green-700"
            }`}
          >
            {goalError ?? goalOk}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-5">
            {goal ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.startWeight")}</p>
                    <p className="text-lg font-semibold">
                      {goal.startWeightKg != null
                        ? `${goal.startWeightKg} kg`
                        : t("common.noData")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.currentWeight")}</p>
                    <p className="text-lg font-semibold">
                      {currentWeightKg != null
                        ? `${currentWeightKg} kg`
                        : t("common.noData")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.targetWeight")}</p>
                    <p className="text-lg font-semibold">
                      {goal.targetWeightKg != null
                        ? `${goal.targetWeightKg} kg`
                        : t("common.noData")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.targetDate")}</p>
                    <p className="text-lg font-semibold">
                      {goal.targetDate ?? t("common.noData")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{t("goal.progress")}</span>
                    <span>{goal.progressPercent != null ? `${progressPercent}%` : t("common.noData")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted">
                  <span>
                    {remainingKg != null
                      ? formatMessage(t("goal.remaining"), {
                          kg: remainingKg.toFixed(1),
                        })
                      : t("common.noData")}
                  </span>
                  <span>
                    {goal.daysLeft != null
                      ? formatMessage(t("goal.daysLeft"), { days: goal.daysLeft })
                      : t("common.noData")}
                  </span>
                  {goal.monthsLeft != null ? (
                    <span>
                      {formatMessage(t("goal.monthsLeft"), { months: goal.monthsLeft })}
                    </span>
                  ) : null}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.recommendedRate")}</p>
                    <p className="text-sm font-semibold">
                      {goalRange
                        ? `${goalRange.min}–${goalRange.max} ${t("goal.rateUnit")}`
                        : t("common.noData")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted">{t("goal.requiredRate")}</p>
                    <p className="text-sm font-semibold">
                      {goal.requiredWeeklyRateKg != null
                        ? `${Math.abs(goal.requiredWeeklyRateKg).toFixed(2)} ${t("goal.rateUnit")}`
                        : t("common.noData")}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">{t("goal.noGoal")}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm text-muted">{t("goal.goalType")}</label>
              <select
                value={goalForm.goalType}
                onChange={(e) => updateGoalType(e.target.value as GoalType)}
              >
                <option value="gain">{goalTypeLabels.gain}</option>
                <option value="lose">{goalTypeLabels.lose}</option>
                <option value="maintain">{goalTypeLabels.maintain}</option>
              </select>
              <p className="text-xs text-muted">{t("goal.goalTypeHint")}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted">{t("goal.strategy")}</label>
              <select
                value={goalForm.strategy}
                onChange={(e) => updateGoalStrategy(e.target.value as GoalStrategy)}
              >
                {strategyOptions.map((option) => (
                  <option key={option} value={option}>
                    {strategyLabels[option]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">{t("goal.strategyHint")}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted">{t("goal.targetWeight")}</label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={goalForm.targetWeightKg}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, targetWeightKg: e.target.value }))}
                disabled={goalForm.goalType === "maintain"}
                placeholder={t("progress.weightPlaceholder")}
              />
              <p className="text-xs text-muted">{t("goal.targetWeightHint")}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted">{t("goal.targetDate")}</label>
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, targetDate: e.target.value }))}
                disabled={goalForm.goalType === "maintain"}
              />
              <p className="text-xs text-muted">{t("goal.targetDateHint")}</p>
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs text-muted">{t("goal.recommendedRate")}</p>
              <p className="text-sm font-semibold">
                {selectedRange
                  ? `${selectedRange.min}–${selectedRange.max} ${t("goal.rateUnit")}`
                  : t("common.noData")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={saveGoal}
                disabled={goalSaving}
              >
                {goalSaving ? t("goal.saving") : t("goal.save")}
              </button>
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={resetGoal}
                disabled={goalSaving}
              >
                {t("goal.reset")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.latestWeight")}</p>
          <p className="text-2xl font-semibold">
            {latest ? `${latest.weight} kg` : t("common.noData")}
          </p>
          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {latest?.date ?? t("progress.noWeight")}
          </span>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.bmi")}</p>
          <p className="text-2xl font-semibold">
            {latestBmi ? latestBmi.toFixed(1) : t("common.noData")}
          </p>
          <p className="text-sm text-muted">
            {latestBmi
              ? bmiLabel(latestBmi)
              : heightCm
              ? t("progress.noWeight")
              : t("progress.heightMissing")}
          </p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.heightFromProfile")}</p>
          <p className="text-2xl font-semibold">
            {heightCm ? `${heightCm} cm` : t("common.noData")}
          </p>
          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {t("progress.profile")}
          </span>
        </div>
      </div>

      <div className="card space-y-4 max-w-md">
        <h2 className="text-lg font-semibold">{t("progress.logTitle")}</h2>

        <input
          type="number"
          step="0.1"
          min={0}
          placeholder={t("progress.weightPlaceholder")}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <button className="btn-primary w-full sm:w-auto" onClick={submit} disabled={saving}>
          {saving ? t("progress.saving") : t("progress.save")}
        </button>

        <p className="text-xs text-muted">{t("progress.hint")}</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">{t("progress.historyTitle")}</h2>

        {items.length === 0 ? (
          <p className="text-sm text-muted">{t("progress.historyEmpty")}</p>
        ) : (
          <div className="space-y-2">
            {items
              .slice()
              .reverse()
              .map((x) => (
                <div
                  key={x._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{x.date}</span>
                  </div>

                  <div className="text-sm text-muted flex flex-wrap items-center gap-3">
                    <span>{x.weight} kg</span>
                    {heightCm ? (
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        BMI {(calcBmi(x.weight, heightCm) ?? 0).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
