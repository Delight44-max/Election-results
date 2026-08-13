"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LgaAnalyticsPoint } from "@/types";

export default function LgaPerformanceChart({ data }: { data: LgaAnalyticsPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted py-10 text-center">No LGA results recorded yet.</p>;
  }
  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D8DDD4" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#5B6B60" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="lgaName"
            tick={{ fontSize: 11, fill: "#5B6B60" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "rgba(31,92,70,0.06)" }}
            contentStyle={{ borderRadius: 10, borderColor: "#D8DDD4", fontSize: 13 }}
            formatter={(value: number) => [value.toLocaleString(), "Total votes"]}
          />
          <Bar dataKey="totalVotes" fill="#1F5C46" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
