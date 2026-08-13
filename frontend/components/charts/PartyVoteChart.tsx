"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { PartyAnalyticsPoint } from "@/types";
import { partyColor } from "@/lib/partyColors";

export default function PartyVoteChart({ data }: { data: PartyAnalyticsPoint[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted py-10 text-center">No party results recorded yet.</p>;
  }
  return (
    <div className="h-64 sm:h-72 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D8DDD4" vertical={false} />
          <XAxis dataKey="party" tick={{ fontSize: 11, fill: "#5B6B60" }} axisLine={{ stroke: "#D8DDD4" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B60" }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            cursor={{ fill: "rgba(31,92,70,0.06)" }}
            contentStyle={{ borderRadius: 10, borderColor: "#D8DDD4", fontSize: 13 }}
            formatter={(value: number) => [value.toLocaleString(), "Votes"]}
          />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={d.party} fill={partyColor(d.party, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
