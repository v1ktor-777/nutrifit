"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WeeklyChart from "@/components/WeeklyChart";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type DashboardData = {
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  workoutToday: boolean;
  workoutsThisWeek: number;
  workoutDates: string[];
};

type WeeklyStat = {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  minutes: number;
  net: number;
};

function formatMessage(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
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
    return <p className="text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted">{t("dashboard.subtitle")}</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("dashboard.caloriesToday")}</p>

          <p className="text-2xl font-semibold">{data.todayCalories} kcal</p>

          <p className="text-sm text-muted">
            {formatMessage(t("dashboard.macros"), {
              protein: data.todayProtein,
              carbs: data.todayCarbs,
              fat: data.todayFat,
            })}
          </p>

          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {t("common.today")}
          </span>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("dashboard.workoutToday")}</p>

          <p
            className={`text-2xl font-semibold ${
              data.workoutToday ? "text-green-600" : "text-muted"
            }`}
          >
            {data.workoutToday
              ? t("dashboard.workoutYes")
              : t("dashboard.workoutNo")}
          </p>

          <span
            className={`inline-block text-xs px-2 py-1 rounded ${
              data.workoutToday
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {data.workoutToday
              ? t("dashboard.workoutYesBadge")
              : t("dashboard.workoutNoBadge")}
          </span>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("dashboard.workoutsThisWeek")}</p>

          <p className="text-2xl font-semibold">{data.workoutsThisWeek}</p>

          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {t("dashboard.workoutsWeekBadge")}
          </span>
        </div>
      </div>

      <div className="card space-y-3">
        <p className="text-sm text-muted">{t("dashboard.workoutDaysTitle")}</p>

        {data.workoutDates && data.workoutDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.workoutDates.map((date) => (
              <span
                key={date}
                className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700"
              >
                ✅ {date}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("dashboard.workoutDaysNone")}</p>
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">{t("dashboard.chartTitle")}</h2>

        {weekly.length === 0 ? (
          <p className="text-muted text-sm">{t("dashboard.chartEmpty")}</p>
        ) : (
          <WeeklyChart data={weekly} />
        )}
      </div>

      <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-medium">{t("dashboard.actionTitle")}</p>
          <p className="text-sm text-muted">{t("dashboard.actionDescription")}</p>
        </div>

        <Link href="/program" className="btn-primary px-6 py-3 w-full sm:w-auto text-center">
          {t("dashboard.actionButton")}
        </Link>
      </div>
    </div>
  );
}
