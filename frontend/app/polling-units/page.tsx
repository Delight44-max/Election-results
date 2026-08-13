"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, buildQuery } from "@/lib/api";
import { PollingUnitSummary, Pagination as PaginationType } from "@/types";
import PaginationNav from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonRow } from "@/components/Skeleton";

export default function PollingUnitsPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [units, setUnits] = useState<PollingUnitSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  async function load() {
    setLoading(true);
    setError(null);
    const query = buildQuery({ page, limit: 20, search: debounced || undefined });
    const res = await apiFetch<PollingUnitSummary[]>(`/api/polling-units${query}`);
    if (res.success) {
      setUnits(res.data);
      if (res.pagination) setPagination(res.pagination);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounced]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Polling Unit Search</h1>
        <p className="mt-2 text-muted max-w-xl">
          Find a polling unit by name or number to see its ward, LGA, state, and full result tally.
        </p>
      </div>

      <div className="relative mb-6 max-w-lg">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          type="search"
          placeholder="e.g. Sapele Ward 8, DT1510002…"
          className="w-full rounded-full border border-line px-4 py-2.5 pl-10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && units.length === 0 ? (
        <EmptyState title="No polling units found" message="Try a different search term." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4">
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ))
            : units.map((u) => (
                <Link
                  key={u.uniqueId}
                  href={`/polling-units/${u.uniqueId}`}
                  className="card p-4 hover:border-forest/40 hover:shadow-lg transition-all group"
                >
                  <p className="font-medium text-sm text-ink group-hover:text-forest truncate">{u.pollingUnitName}</p>
                  <p className="text-xs text-muted mt-1">{u.pollingUnitNumber || `PU ${u.pollingUnitId}`}</p>
                  <div className="mt-3 pt-3 border-t border-line text-xs text-muted space-y-1">
                    <p className="truncate">Ward: {u.wardName || "—"}</p>
                    <p className="truncate">LGA: {u.lgaName}</p>
                    <p className="truncate">State: {u.stateName}</p>
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
