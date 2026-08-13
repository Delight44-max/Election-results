"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { LgaAnalyticsPoint, Overview, PartyAnalyticsPoint } from "@/types";
import StatCard from "@/components/StatCard";
import { SkeletonCard } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import PartyVoteChart from "@/components/charts/PartyVoteChart";
import LgaPerformanceChart from "@/components/charts/LgaPerformanceChart";

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [parties, setParties] = useState<PartyAnalyticsPoint[]>([]);
  const [lgas, setLgas] = useState<LgaAnalyticsPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    const [ov, pa, la] = await Promise.all([
      apiFetch<Overview>("/api/analytics/overview"),
      apiFetch<{ byParty: PartyAnalyticsPoint[] }>("/api/analytics/parties"),
      apiFetch<LgaAnalyticsPoint[]>("/api/analytics/lgas"),
    ]);
    if (!ov.success) {
      setError(ov.error.message);
    } else {
      setOverview(ov.data);
      if (pa.success) setParties(pa.data.byParty);
      if (la.success) setLgas(la.data.slice(0, 8));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <section className="mb-8 sm:mb-10">
        <p className="text-xs font-medium uppercase tracking-wider text-forest">
          Delta State · Collated Results
        </p>
        <h1 className="mt-2 font-display font-semibold text-3xl sm:text-4xl text-ink max-w-2xl">
          Election Results Dashboard
        </h1>
        <p className="mt-3 text-muted max-w-xl">
          Live standings collated from polling-unit and LGA return sheets across Delta State —
          searchable down to a single polling unit, or rolled up into party-wide performance.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/results" className="px-4 py-2 rounded-full bg-forest text-paper text-sm font-medium hover:bg-forest-dark transition-colors">
            View Results
          </Link>
          <Link href="/polling-units" className="px-4 py-2 rounded-full border border-line text-sm font-medium hover:bg-forest/5 transition-colors">
            Search Polling Unit
          </Link>
          <Link href="/lgas" className="px-4 py-2 rounded-full border border-line text-sm font-medium hover:bg-forest/5 transition-colors">
            Explore LGAs
          </Link>
          <Link href="/parties" className="px-4 py-2 rounded-full border border-line text-sm font-medium hover:bg-forest/5 transition-colors">
            Party Analysis
          </Link>
        </div>
      </section>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {loading || !overview ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard label="Total Votes" value={overview.totalVotesRecorded.toLocaleString()} accent />
                <StatCard label="Polling Units" value={overview.totalPollingUnits.toLocaleString()} sublabel={`${overview.totalWards} wards`} />
                <StatCard label="LGAs" value={overview.totalLgas.toLocaleString()} sublabel={`${overview.totalStates} state${overview.totalStates === 1 ? "" : "s"}`} />
                <StatCard label="Parties" value={overview.totalParties.toLocaleString()} />
                <StatCard label="Results Entered" value={overview.resultsEntered.toLocaleString()} />
                <StatCard label="PU Votes" value={overview.puVotesRecorded.toLocaleString()} />
                <StatCard label="LGA Votes" value={overview.lgaVotesRecorded.toLocaleString()} />
                <StatCard label="Collation Agents" value={overview.totalAgents.toLocaleString()} />
              </>
            )}
          </section>

          <section className="grid lg:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">Party Vote Distribution</h2>
              <p className="text-sm text-muted mb-4">Combined polling-unit and LGA tallies, by party.</p>
              {loading ? <div className="skeleton h-64 w-full" /> : <PartyVoteChart data={parties} />}
            </div>
            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-ink mb-1">LGA Performance</h2>
              <p className="text-sm text-muted mb-4">Total announced votes by local government area.</p>
              {loading ? <div className="skeleton h-64 w-full" /> : <LgaPerformanceChart data={lgas} />}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
