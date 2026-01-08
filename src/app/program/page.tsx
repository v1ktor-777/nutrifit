"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatMessage(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}

export default function ProgramPage() {
  const { t } = useI18n();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [highlightPreview, setHighlightPreview] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [dayLog, setDayLog] = useState<any>(null);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    goal: "maintain",
    level: "beginner",
    daysPerWeek: 4,
    equipment: "gym",
  });

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHighlightPreview(true);
  };

  useEffect(() => {
    if (!highlightPreview) return;
    const timer = setTimeout(() => setHighlightPreview(false), 300);
    return () => clearTimeout(timer);
  }, [highlightPreview]);

  const isDaysValid = form.daysPerWeek >= 3 && form.daysPerWeek <= 6;

  const getDaysDescription = () => {
    if (!isDaysValid) {
      return t("program.daysInvalid");
    }

    const goalText =
      form.goal === "bulk"
        ? t("program.goalSummaryBulk")
        : form.goal === "cut"
        ? t("program.goalSummaryCut")
        : t("program.goalSummaryMaintain");

    const levelText =
      form.level === "beginner"
        ? t("program.levelSummaryBeginner")
        : t("program.levelSummaryIntermediate");

    return formatMessage(t("program.daysSummary"), {
      days: form.daysPerWeek,
      goal: goalText,
      level: levelText,
    });
  };

  const getWhySplitText = () => {
    if (form.daysPerWeek <= 3) {
      return t("program.whySplitLow");
    }
    if (form.daysPerWeek <= 5) {
      return t("program.whySplitMedium");
    }
    return t("program.whySplitHigh");
  };

  const loadProgram = async () => {
    try {
      const res = await fetch("/api/program");
      if (!res.ok) {
        setProgram(null);
        return;
      }

      const data = await res.json();
      if (!data || !data.plan) {
        setProgram(null);
        return;
      }

      setProgram(data);
    } catch (err) {
      console.error("Load program error:", err);
      setProgram(null);
    }
  };

  const loadWorkoutForDate = async (date: string) => {
    try {
      const res = await fetch(`/api/workout-log?date=${encodeURIComponent(date)}`);
      if (!res.ok) {
        setDayLog(null);
        return;
      }
      const json = await res.json();
      setDayLog(json?.data ?? null);
    } catch (err) {
      console.error("Load workout for date error:", err);
      setDayLog(null);
    }
  };

  const loadWorkoutDates = async () => {
    try {
      const res = await fetch("/api/workout-log?days=7");
      if (!res.ok) {
        setWorkoutDates([]);
        return;
      }
      const json = await res.json();
      setWorkoutDates(Array.isArray(json?.dates) ? json.dates : []);
    } catch (err) {
      console.error("Load workout dates error:", err);
      setWorkoutDates([]);
    }
  };

  useEffect(() => {
    loadProgram();
    loadWorkoutDates();
    loadWorkoutForDate(selectedDate);
  }, []);

  useEffect(() => {
    loadWorkoutForDate(selectedDate);
  }, [selectedDate]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDaysValid) return;

    try {
      setLoading(true);

      const res = await fetch("/api/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert(t("program.alertGenerateFailed"));
        return;
      }

      const data = await res.json();
      if (!data?.plan) {
        alert(t("program.alertNoPlan"));
        return;
      }

      setProgram(data);
      await loadWorkoutDates();
      await loadWorkoutForDate(selectedDate);
    } catch (err) {
      console.error("Generate error:", err);
      alert(t("program.alertGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (day: any) => {
    setSaveError(null);
    setSavingDay(day.day);

    try {
      const res = await fetch("/api/workout-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: day.day,
          focus: day.focus,
          minutes: 60,
          caloriesOut: 300,
          date: selectedDate,
        }),
      });

      let text = "";
      try {
        text = await res.text();
      } catch {}

      if (!res.ok) {
        setSaveError(`POST /api/workout-log -> ${res.status} ${text}`);
        return;
      }

      await loadWorkoutForDate(selectedDate);
      await loadWorkoutDates();
    } catch (err: any) {
      setSaveError(`Fetch error: ${err?.message ?? String(err)}`);
    } finally {
      setSavingDay(null);
    }
  };

  const unmarkSelectedDate = async () => {
    setSaveError(null);
    setSavingDay("UNMARK");

    try {
      const res = await fetch(
        `/api/workout-log?date=${encodeURIComponent(selectedDate)}`,
        { method: "DELETE" }
      );

      let text = "";
      try {
        text = await res.text();
      } catch {}

      if (!res.ok) {
        setSaveError(`DELETE /api/workout-log -> ${res.status} ${text}`);
        return;
      }

      await loadWorkoutForDate(selectedDate);
      await loadWorkoutDates();
    } catch (err: any) {
      setSaveError(`Fetch error: ${err?.message ?? String(err)}`);
    } finally {
      setSavingDay(null);
    }
  };

  const isSelectedDateMarked = workoutDates.includes(selectedDate);

  return (
    <div className="max-w-5xl space-y-14">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t("program.title")}</h1>
        <p className="text-muted max-w-2xl">{t("program.subtitle")}</p>
      </header>

      {!program && (
        <form
          onSubmit={generate}
          className="card space-y-14 border-border/60 shadow-md"
        >
          <section className="space-y-6">
            <h2 className="text-lg font-medium">{t("program.goalTitle")}</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <select
                value={form.goal}
                onChange={(e) => updateForm("goal", e.target.value)}
              >
                <option value="cut">{t("program.goalCut")}</option>
                <option value="bulk">{t("program.goalBulk")}</option>
                <option value="maintain">{t("program.goalMaintain")}</option>
              </select>

              <select
                value={form.level}
                onChange={(e) => updateForm("level", e.target.value)}
              >
                <option value="beginner">{t("program.levelBeginner")}</option>
                <option value="intermediate">{t("program.levelIntermediate")}</option>
              </select>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium">{t("program.daysTitle")}</h2>

            <input
              type="number"
              min={3}
              max={6}
              value={form.daysPerWeek}
              onChange={(e) =>
                updateForm("daysPerWeek", Number(e.target.value))
              }
            />

            <p className={`text-sm ${isDaysValid ? "text-muted" : "text-red-500"}`}>
              {getDaysDescription()}
            </p>

            <div className="rounded-lg bg-muted/40 p-4 border">
              <p className="font-medium mb-1">{t("program.whySplitTitle")}</p>
              <p className="text-sm text-muted">{getWhySplitText()}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium">{t("program.equipmentTitle")}</h2>

            <select
              value={form.equipment}
              onChange={(e) => updateForm("equipment", e.target.value)}
            >
              <option value="gym">{t("program.equipmentGym")}</option>
              <option value="home">{t("program.equipmentHome")}</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={!isDaysValid || loading}
            className="btn-primary px-12 py-3"
          >
            {loading ? t("program.submitting") : t("program.submit")}
          </button>
        </form>
      )}

      {program && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("program.activeTitle")}</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setProgram(null)}
            >
              {t("program.regenerate")}
            </button>
          </div>

          <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">{t("program.dateCardTitle")}</p>
              <p className="text-sm text-muted">
                {formatMessage(t("program.dateCardLast7Days"), {
                  status: isSelectedDateMarked
                    ? t("program.dateCardMarked")
                    : t("program.dateCardUnmarked"),
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              {isSelectedDateMarked && (
                <button
                  type="button"
                  disabled={Boolean(savingDay)}
                  className="btn-secondary"
                  onClick={() => void unmarkSelectedDate()}
                >
                  {savingDay === "UNMARK"
                    ? t("program.unmarking")
                    : t("program.unmark")}
                </button>
              )}
            </div>
          </div>

          {saveError && (
            <div className="card border border-red-300 bg-red-50 text-red-700 text-sm">
              {saveError}
            </div>
          )}

          {program.plan.map((day: any, idx: number) => {
            const isThisDayCompletedForSelectedDate =
              dayLog?.day === day.day && isSelectedDateMarked;

            const hasAnyForSelectedDate = Boolean(dayLog) && isSelectedDateMarked;
            const canSwitch = hasAnyForSelectedDate && !isThisDayCompletedForSelectedDate;

            const isSavingThis = savingDay === day.day;
            const isUnmarking = savingDay === "UNMARK";

            return (
              <div key={idx} className="card space-y-3">
                <h3 className="font-semibold">
                  {day.day} • {day.focus}
                </h3>

                <ul className="text-sm text-muted space-y-1">
                  {day.exercises.map((ex: any, i: number) => (
                    <li key={i}>
                      {formatMessage(t("program.exerciseItem"), {
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                      })}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-3">
                  {isThisDayCompletedForSelectedDate ? (
                    <>
                      <span className="text-green-700 text-sm font-medium">
                        {formatMessage(t("program.completedOn"), {
                          date: selectedDate,
                        })}
                      </span>

                      <button
                        type="button"
                        disabled={Boolean(savingDay)}
                        className="btn-secondary"
                        onClick={() => void unmarkSelectedDate()}
                      >
                        {isUnmarking ? t("program.unmarking") : t("program.unmark")}
                      </button>
                    </>
                  ) : canSwitch ? (
                    <button
                      type="button"
                      disabled={Boolean(savingDay)}
                      className="btn-secondary"
                      onClick={() => void saveWorkout(day)}
                    >
                      {isSavingThis ? t("common.saving") : t("program.switchToDay")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(savingDay)}
                      className="btn-primary"
                      onClick={() => void saveWorkout(day)}
                    >
                      {isSavingThis ? t("common.saving") : t("program.markWorkout")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
