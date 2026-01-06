"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DayStat = {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  net: number;
};

export default function WeeklyChart({ data }: { data: DayStat[] }) {
  console.log("WeeklyChart data:", data);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis unit="cal" />
        <Tooltip />

        <Line type="monotone" dataKey="caloriesIn" name="calories" stroke="#22c55e" />
      </LineChart>
    </ResponsiveContainer>
  );
}
