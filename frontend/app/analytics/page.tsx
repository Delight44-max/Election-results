"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { LgaAnalyticsPoint, PartyAnalyticsPoint } from "@/types";
import PartyVoteChart from "@/components/charts/PartyVoteChart";
import LgaPerformanceChart from "@/components/charts/LgaPerformanceChart";
import StatCard from "@/components/StatCard";
import ErrorState from "@/components/ErrorState";
import { partyColor } from "@/lib/partyColors";

interface Coverage {
  lgaCoverage: { total: number; withResults: number; percentage: number };
  pollingUnitCoverage: { total: number; withResults: number; percentage: number };
}

interface TopPu {
  pollingUnitId: number;
  name: string;
  lgaName: string | null;
  wardName: string | null;
  totalVotes: number;
}

export default function AnalyticsPage() {
  const [parties, setParties] = useState<PartyAnalyticsPoint[]>([]);
  const [lgas, setLgas] = useState<LgaAnalyticsPoint[]>([]);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [topPu, setTopPu] = useState<TopPu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const [pa, la, cov, top] = await Promise.all([
      apiFetch<{ byParty: PartyAnalyticsPoint[] }>("/api/analytics/parties"),
      apiFetch<LgaAnalyticsPoint[]>("/api/analytics/lgas"),
      apiFetch<Coverage>("/api/analytics/coverage"),
      apiFetch<TopPu[]>("/api/analytics/top-polling-units?limit=8"),
    ]);
    if (!pa.success) {
      setError(pa.error.message);
    } else {
      setParties(pa.data.byParty);
      if (la.success) setLgas(la.data);
      if (cov.success) setCoverage(cov.data);
      if (top.success) setTopPu(top.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const winningParties = lgas.filter((l) => l.winner).reduce<Record<string, number>>((acc, l) => {
    const p = l.winner!.party;
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Results Analytics</h1>
        <p className="mt-2 text-muted max-w-xl">A full breakdown of votes, coverage, and party performance.</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="space-y-5 sm:space-y-6">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              label="LGA Coverage"
              value={coverage ? `${coverage.lgaCoverage.percentage}%` : "—"}
              sublabel={coverage ? `${coverage.lgaCoverage.withResults}/${coverage.lgaCoverage.total} LGAs` : undefined}
              accent
            />
            <StatCard
              label="PU Coverage"
              value={coverage ? `${coverage.pollingUnitCoverage.percentage}%` : "—"}
              sublabel={coverage ? `${coverage.pollingUnitCoverage.withResults}/${coverage.pollingUnitCoverage.total} units` : undefined}
            />
            <StatCard label="Parties Tracked" value={parties.length.toString()} />
            <StatCard label="LGAs Reporting" value={lgas.length.toString()} />
          </section>

          <section className="grid lg:grid-cols-2 gap-5">
            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">1. Votes by Party</h2>
              <p className="text-sm text-muted mb-4">Combined PU + LGA tallies.</p>
              {loading ? <div className="skeleton h-64 w-full" /> : <PartyVoteChart data={parties} />}
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">2. Party Percentage Distribution</h2>
              <p className="text-sm text-muted mb-4">Share of total votes recorded.</p>
              {loading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <div className="space-y-2.5">
                  {parties.slice(0, 9).map((p, i) => (
                    <div key={p.party} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-medium text-ink">{p.party}</span>
                      <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.percentage}%`, backgroundColor: partyColor(p.party, i) }}
                        />
                      </div>
                      <span className="w-12 text-xs text-muted text-right">{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">3. Votes by LGA</h2>
              <p className="text-sm text-muted mb-4">Total votes recorded per local government area.</p>
              {loading ? <div className="skeleton h-64 w-full" /> : <LgaPerformanceChart data={lgas.slice(0, 10)} />}
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">4. Top Polling Units</h2>
              <p className="text-sm text-muted mb-4">Highest total votes recorded at a single unit.</p>
              {loading ? (
                <div className="skeleton h-64 w-full" />
              ) : (
                <div className="space-y-0.5">
                  {topPu.map((u, i) => (
                    <div key={u.pollingUnitId} className="tally-row">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="stat-figure text-xs text-muted w-5">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                          <p className="text-xs text-muted truncate">{u.lgaName}</p>
                        </div>
                      </div>
                      <span className="stat-figure text-sm font-medium text-ink shrink-0">
                        {u.totalVotes.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5 sm:p-6 lg:col-span-2">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">5. Winning Parties by LGA</h2>
              <p className="text-sm text-muted mb-4">Number of LGAs where each party recorded the highest tally.</p>
              {loading ? (
                <div className="skeleton h-24 w-full" />
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(winningParties)
                    .sort((a, b) => b[1] - a[1])
                    .map(([party, count]) => (
                      <div
                        key={party}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-line"
                        style={{ borderColor: `${partyColor(party)}55` }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: partyColor(party) }} />
                        <span className="text-sm font-medium text-ink">{party}</span>
                        <span className="stat-figure text-xs text-muted">{count} LGA{count === 1 ? "" : "s"}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
