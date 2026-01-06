"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WeeklyChart from "@/components/WeeklyChart";

type DashboardData = {
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  workoutToday: boolean;
  workoutsThisWeek: number;

  // ✅ НОВО: дати (YYYY-MM-DD) за последните 7 дни с тренировка
  workoutDates: string[];
};

type WeeklyStat = {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  minutes: number;
  net: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
    ]).then(([dashboardRes, weeklyRes]) => {
      setData(dashboardRes);
      setWeekly(weeklyRes.data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return <p className="text-muted">Зареждане...</p>;
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Табло</h1>
        <p className="text-muted">Обобщение на активността ти</p>
      </header>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Calories Today */}
        <div className="card space-y-2">
          <p className="text-sm text-muted">Калории днес</p>

          <p className="text-2xl font-semibold">{data.todayCalories} kcal</p>

          <p className="text-sm text-muted">
            P: {data.todayProtein}g • C: {data.todayCarbs}g • F: {data.todayFat}
            g
          </p>

          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            Днес
          </span>
        </div>

        {/* Workout Today */}
        <div className="card space-y-2">
          <p className="text-sm text-muted">Тренировка днес</p>

          <p
            className={`text-2xl font-semibold ${
              data.workoutToday ? "text-green-600" : "text-muted"
            }`}
          >
            {data.workoutToday ? "Готово" : "Не е направена"}
          </p>

          <span
            className={`inline-block text-xs px-2 py-1 rounded ${
              data.workoutToday
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {data.workoutToday ? "✔ Днес" : "Очаква се"}
          </span>
        </div>

        {/* Workouts This Week */}
        <div className="card space-y-2">
          <p className="text-sm text-muted">Тренировки тази седмица</p>

          <p className="text-2xl font-semibold">{data.workoutsThisWeek}</p>

          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            Последни 7 дни
          </span>
        </div>
      </div>

      {/* ✅ WORKOUT DAYS (LAST 7 DAYS) */}
      <div className="card space-y-3">
        <p className="text-sm text-muted">Дни с тренировка (последни 7 дни)</p>

        {data.workoutDates && data.workoutDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.workoutDates.map((date) => (
              <span
                key={date}
                className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700"
              >
                ✔ {date}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Няма записани тренировки</p>
        )}
      </div>

      {/* WEEKLY CHART */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Последните 7 дни</h2>

        {weekly.length === 0 ? (
          <p className="text-muted text-sm">Няма данни за периода</p>
        ) : (
          <WeeklyChart data={weekly} />
        )}
      </div>

      {/* ACTION */}
      <div className="card flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Тренировъчна програма</p>
          <p className="text-sm text-muted">
            Управлявай и следи активната си програма
          </p>
        </div>

        <Link href="/program" className="btn-primary px-6 py-3">
          Към програмата
        </Link>
      </div>
    </div>
  );
}
