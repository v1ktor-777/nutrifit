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
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />

        <Line type="monotone" dataKey="caloriesIn" stroke="#22c55e" />
        <Line type="monotone" dataKey="caloriesOut" stroke="#ef4444" />
        <Line type="monotone" dataKey="net" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}
