"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Party } from "@/types";
import { SkeletonCard } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import { partyColor } from "@/lib/partyColors";

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<Party[]>("/api/parties");
    if (res.success) setParties(res.data);
    else setError(res.error.message);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Party Analysis</h1>
        <p className="mt-2 text-muted max-w-xl">Select a party to see its overall performance, strongholds, and reach.</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : parties.map((p) => (
                <Link
                  key={p.partyId}
                  href={`/parties/${p.partyId}`}
                  className="card p-5 hover:border-forest/40 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: partyColor(p.partyId) }} />
                    <p className="font-display font-semibold text-lg text-ink group-hover:text-forest">{p.partyName}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted">PU Votes</p>
                      <p className="stat-figure font-medium text-ink">{p.totalPuVotes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted">LGA Votes</p>
                      <p className="stat-figure font-medium text-ink">{p.totalLgaVotes.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}
