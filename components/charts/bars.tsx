"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function Bars({ data, dataKey = "minutes" }: { data: { label: string; [key: string]: string | number }[]; dataKey?: string }) {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#73977F");
  useEffect(() => {
    const next = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (next) setColor(next);
  }, [resolvedTheme]);

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={18}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7C877F", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)" }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[7, 7, 3, 3]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeightChart({ data }: { data: { date: string; value: number }[] }) {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#73977F");
  useEffect(() => {
    const next = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (next) setColor(next);
  }, [resolvedTheme]);
  if (data.length < 2) return <p className="text-sm text-muted">Добавьте ещё одну точку, и здесь появится линия.</p>;
  const min = Math.min(...data.map((item) => item.value)) - 0.4;
  const max = Math.max(...data.map((item) => item.value)) + 0.4;
  const width = 320;
  const height = 120;
  const step = width / (data.length - 1);
  const points = data
    .map((item, index) => {
      const x = index * step;
      const y = height - ((item.value - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}
