"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, buildQuery } from "@/lib/api";
import { LgaSummary, StateSummary, Pagination as PaginationType } from "@/types";
import PaginationNav from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonCard } from "@/components/Skeleton";

export default function LgasPage() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [stateId, setStateId] = useState("");
  const [page, setPage] = useState(1);
  const [lgas, setLgas] = useState<LgaSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<StateSummary[]>("/api/states").then((res) => {
      if (res.success) setStates(res.data.filter((s) => s.lgaCount > 0));
    });
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const query = buildQuery({ page, limit: 24, state: stateId || undefined });
    const res = await apiFetch<LgaSummary[]>(`/api/lgas${query}`);
    if (res.success) {
      setLgas(res.data);
      if (res.pagination) setPagination(res.pagination);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, stateId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Local Government Areas</h1>
        <p className="mt-2 text-muted max-w-xl">Select a state, then an LGA, to see party standings and the winner.</p>
      </div>

      <div className="mb-6">
        <select
          value={stateId}
          onChange={(e) => {
            setPage(1);
            setStateId(e.target.value);
          }}
          className="text-sm rounded-full border border-line px-3.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-forest/30"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s.stateId} value={s.stateId}>
              {s.stateName} ({s.lgaCount})
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && lgas.length === 0 ? (
        <EmptyState title="No LGAs found" message="Try a different state." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : lgas.map((l) => (
                <Link
                  key={l.uniqueId}
                  href={`/lgas/${l.uniqueId}`}
                  className="card p-4 hover:border-forest/40 hover:shadow-lg transition-all group"
                >
                  <p className="font-display font-semibold text-ink group-hover:text-forest">{l.lgaName}</p>
                  <p className="text-xs text-muted mt-1">{l.stateName}</p>
                  <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
                    <span>{l.wardCount} wards</span>
                    <span>{l.pollingUnitCount} polling units</span>
                  </div>
                </Link>
              ))}
        </div>
      )}

      {pagination && (
        <div className="mt-6">
          <PaginationNav page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
