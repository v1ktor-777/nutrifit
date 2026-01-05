"use client";

import { useEffect, useState } from "react";

export default function ProgramPage() {
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [highlightPreview, setHighlightPreview] = useState(false);

  const [todayLog, setTodayLog] = useState<any>(null);

  // ✅ показваме "кликна ли" + грешка
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    goal: "maintain",
    level: "beginner",
    daysPerWeek: 4,
    equipment: "gym",
  });

  /* ======================
     HELPERS
     ====================== */

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHighlightPreview(true);
  };

  useEffect(() => {
    if (!highlightPreview) return;
    const t = setTimeout(() => setHighlightPreview(false), 300);
    return () => clearTimeout(t);
  }, [highlightPreview]);

  const isDaysValid = form.daysPerWeek >= 3 && form.daysPerWeek <= 6;

  const getDaysDescription = () => {
    if (!isDaysValid) {
      return "Моля избери между 3 и 6 тренировъчни дни седмично.";
    }

    const goalText =
      form.goal === "bulk"
        ? "покачване на мускулна маса"
        : form.goal === "cut"
        ? "изчистване"
        : "поддържане на форма";

    const levelText =
      form.level === "beginner" ? "начинаещо" : "средно напреднало";

    return `${form.daysPerWeek} тренировъчни дни седмично са отличен избор за ${goalText} при ${levelText} ниво.`;
  };

  const getWhySplitText = () => {
    if (form.daysPerWeek <= 3) {
      return "По-ниската честота позволява пълно възстановяване и стабилна основа.";
    }
    if (form.daysPerWeek <= 5) {
      return "Оптимален баланс между тренировъчен обем, прогрес и възстановяване.";
    }
    return "По-висока честота с леко намален обем за по-добро възстановяване.";
  };

  /* ======================
     LOAD ACTIVE PROGRAM
     ====================== */

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

  const loadTodayWorkout = async () => {
    try {
      const res = await fetch("/api/workout-log");
      if (!res.ok) {
        setTodayLog(null);
        return;
      }
      const json = await res.json();
      setTodayLog(json?.data ?? null);
    } catch (err) {
      console.error("Load today workout error:", err);
      setTodayLog(null);
    }
  };

  useEffect(() => {
    loadProgram();
    loadTodayWorkout();
  }, []);

  /* ======================
     GENERATE PROGRAM
     ====================== */

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
        alert("Грешка при генериране.");
        return;
      }

      const data = await res.json();
      if (!data?.plan) {
        alert("Невалидна програма.");
        return;
      }

      setProgram(data);
      await loadTodayWorkout();
    } catch (err) {
      console.error("Generate error:", err);
      alert("Възникна грешка.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     WORKOUT LOG ACTIONS
     ====================== */

  // Mark / Switch (POST)
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

      await loadTodayWorkout();
    } catch (err: any) {
      setSaveError(`Fetch error: ${err?.message ?? String(err)}`);
    } finally {
      setSavingDay(null);
    }
  };

  // Unmark (DELETE)
  const unmarkToday = async () => {
    setSaveError(null);
    setSavingDay("UNMARK");

    try {
      const res = await fetch("/api/workout-log", { method: "DELETE" });

      let text = "";
      try {
        text = await res.text();
      } catch {}

      if (!res.ok) {
        setSaveError(`DELETE /api/workout-log -> ${res.status} ${text}`);
        return;
      }

      await loadTodayWorkout();
    } catch (err: any) {
      setSaveError(`Fetch error: ${err?.message ?? String(err)}`);
    } finally {
      setSavingDay(null);
    }
  };

  /* ======================
     UI
     ====================== */

  return (
    <div className="max-w-5xl space-y-14">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Моята тренировъчна програма
        </h1>
        <p className="text-muted max-w-2xl">
          Конфигурирай персонална програма според целите, възможностите и средата
          си.
        </p>
      </header>

      {!program && (
        <form
          onSubmit={generate}
          className="card space-y-14 border-border/60 shadow-md"
        >
          <section className="space-y-6">
            <h2 className="text-lg font-medium">Основни настройки</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <select
                value={form.goal}
                onChange={(e) => updateForm("goal", e.target.value)}
              >
                <option value="cut">Изчистване</option>
                <option value="bulk">Покачване на мускулна маса</option>
                <option value="maintain">Поддържане</option>
              </select>

              <select
                value={form.level}
                onChange={(e) => updateForm("level", e.target.value)}
              >
                <option value="beginner">Начинаещ</option>
                <option value="intermediate">Средно напреднал</option>
              </select>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium">Тренировъчна честота</h2>

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
              <p className="font-medium mb-1">Защо този сплит?</p>
              <p className="text-sm text-muted">{getWhySplitText()}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-medium">Среда</h2>

            <select
              value={form.equipment}
              onChange={(e) => updateForm("equipment", e.target.value)}
            >
              <option value="gym">Фитнес зала</option>
              <option value="home">Вкъщи</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={!isDaysValid || loading}
            className="btn-primary px-12 py-3"
          >
            {loading ? "Генериране..." : "Генерирай програмата"}
          </button>
        </form>
      )}

      {program && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Активна програма</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setProgram(null)}
            >
              Нова програма
            </button>
          </div>

          {saveError && (
            <div className="card border border-red-300 bg-red-50 text-red-700 text-sm">
              {saveError}
            </div>
          )}

          {program.plan.map((day: any, idx: number) => {
            const isThisDayCompleted = todayLog?.day === day.day;
            const hasAnyToday = Boolean(todayLog);
            const canSwitch = hasAnyToday && !isThisDayCompleted;

            const isSavingThis = savingDay === day.day;
            const isUnmarking = savingDay === "UNMARK";

            return (
              <div key={idx} className="card space-y-3">
                <h3 className="font-semibold">
                  {day.day} — {day.focus}
                </h3>

                <ul className="text-sm text-muted space-y-1">
                  {day.exercises.map((ex: any, i: number) => (
                    <li key={i}>
                      {ex.name} — {ex.sets} серии × {ex.reps} повторения
                    </li>
                  ))}
                </ul>

                {/* ✅ ACTIONS */}
                <div className="flex items-center gap-3">
                  {isThisDayCompleted ? (
                    <>
                      <span className="text-green-700 text-sm font-medium">
                        ✔ Тренировката е записана
                      </span>

                      <button
                        type="button"
                        disabled={Boolean(savingDay)}
                        className="btn-secondary"
                        onClick={() => void unmarkToday()}
                      >
                        {isUnmarking ? "Махане..." : "Махни отметката"}
                      </button>
                    </>
                  ) : canSwitch ? (
                    <button
                      type="button"
                      disabled={Boolean(savingDay)}
                      className="btn-secondary"
                      onClick={() => void saveWorkout(day)}
                    >
                      {isSavingThis ? "Записване..." : "Смени на този ден"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(savingDay)}
                      className="btn-primary"
                      onClick={() => void saveWorkout(day)}
                    >
                      {isSavingThis ? "Записване..." : "Маркирай като завършена"}
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
    