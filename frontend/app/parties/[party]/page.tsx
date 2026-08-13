"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { PartyAnalysis } from "@/types";
import StatCard from "@/components/StatCard";
import { SkeletonCard } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import { partyColor } from "@/lib/partyColors";

export default function PartyDetailPage() {
  const params = useParams();
  const partyId = params.party as string;
  const [data, setData] = useState<PartyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<PartyAnalysis>(`/api/parties/${partyId}/results`);
    if (res.success) setData(res.data);
    else setError(res.error.message);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link href="/parties" className="text-sm text-forest hover:text-forest-dark inline-flex items-center gap-1 mb-6">
        ← Back to Parties
      </Link>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading || !data ? (
        <div className="grid grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-paper font-display font-semibold text-xs"
              style={{ backgroundColor: partyColor(data.party.partyId) }}
            >
              {data.party.partyId.slice(0, 3)}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-forest">Party</p>
              <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">{data.party.partyName}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
            <StatCard label="Polling-Unit Votes" value={data.totalPuVotes.toLocaleString()} accent />
            <StatCard label="LGA Votes" value={data.totalLgaVotes.toLocaleString()} />
            <StatCard label="Share of PU Votes" value={`${data.percentageOfPuVotes}%`} />
            <StatCard label="LGAs Won" value={data.lgasWon.toLocaleString()} />
            <StatCard label="Polling Units Won" value={data.pollingUnitsWon.toLocaleString()} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wider text-muted">Strongest LGA</p>
              {data.strongestLga ? (
                <>
                  <p className="font-display font-semibold text-lg text-ink mt-1">{data.strongestLga.name}</p>
                  <p className="stat-figure text-sm text-muted mt-0.5">{data.strongestLga.votes.toLocaleString()} votes</p>
                </>
              ) : (
                <p className="text-sm text-muted mt-1">No LGA results recorded</p>
              )}
            </div>
            <div className="card p-5">
              <p className="text-xs uppercase tracking-wider text-muted">Strongest Polling Unit</p>
              {data.strongestPollingUnit ? (
                <>
                  <p className="font-display font-semibold text-lg text-ink mt-1">{data.strongestPollingUnit.name}</p>
                  <p className="stat-figure text-sm text-muted mt-0.5">
                    {data.strongestPollingUnit.votes.toLocaleString()} votes
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted mt-1">No polling-unit results recorded</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
