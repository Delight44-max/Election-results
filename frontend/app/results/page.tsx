"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, buildQuery } from "@/lib/api";
import { ResultRow, Pagination as PaginationType } from "@/types";
import PaginationNav from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

const PARTIES = ["PDP", "DPP", "ACN", "PPA", "CDC", "JP", "ANPP", "LABO", "CPP"];

export default function ResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [party, setParty] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const query = buildQuery({ page, limit: 20, party: party || undefined, sortBy: "score", sortDir });
    const res = await apiFetch<ResultRow[]>(`/api/results${query}`);
    if (res.success) {
      setRows(res.data);
      if (res.pagination) setPagination(res.pagination);
    } else {
      setError(res.error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, party, sortDir]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Election Results</h1>
        <p className="mt-2 text-muted max-w-xl">
          Every polling-unit result on record, filterable by party and sorted by vote count.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <select
          value={party}
          onChange={(e) => {
            setPage(1);
            setParty(e.target.value);
          }}
          className="text-sm rounded-full border border-line px-3.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-forest/30"
        >
          <option value="">All parties</option>
          {PARTIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="text-sm rounded-full border border-line px-3.5 py-2 bg-surface hover:bg-forest/5 flex items-center gap-1.5"
        >
          Votes {sortDir === "desc" ? "↓" : "↑"}
        </button>
        {pagination && <span className="text-xs text-muted ml-auto">{pagination.total.toLocaleString()} results</span>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && rows.length === 0 ? (
        <EmptyState title="No results match this filter" message="Try a different party or clear the filter." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 sm:px-5 py-3 font-medium">Polling Unit</th>
                  <th className="px-4 py-3 font-medium">Ward</th>
                  <th className="px-4 py-3 font-medium">LGA</th>
                  <th className="px-4 py-3 font-medium">Party</th>
                  <th className="px-4 sm:px-5 py-3 font-medium text-right">Votes</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-line last:border-b-0">
                        <td className="px-4 sm:px-5 py-3.5" colSpan={5}>
                          <div className="skeleton h-4 w-full" />
                        </td>
                      </tr>
                    ))
                  : rows.map((r) => (
                      <tr key={r.resultId} className="border-b border-line last:border-b-0 hover:bg-forest/[0.03]">
                        <td className="px-4 sm:px-5 py-3.5">
                          <Link href={`/polling-units/${r.pollingUnitId}`} className="font-medium text-ink hover:text-forest">
                            {r.pollingUnitName}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-muted whitespace-nowrap">{r.wardName || "—"}</td>
                        <td className="px-4 py-3.5 text-muted whitespace-nowrap">{r.lgaName}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-forest/10 text-forest-dark text-xs font-medium">
                            {r.party}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-right stat-figure font-medium text-ink">
                          {r.votes.toLocaleString()}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && (
        <div className="mt-5">
          <PaginationNav page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
