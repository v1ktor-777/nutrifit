"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type DayStat = {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  net: number;
};

export default function WeeklyChart({ data }: { data: DayStat[] }) {
  const { t } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis unit={t("dashboard.chartUnit")} />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="caloriesIn"
          name={t("dashboard.caloriesLabel")}
          stroke="#22c55e"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
