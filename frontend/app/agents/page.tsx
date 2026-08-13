"use client";

import { useEffect, useState } from "react";
import { apiFetch, buildQuery } from "@/lib/api";
import { Agent, Pagination as PaginationType } from "@/types";
import PaginationNav from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
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
    const res = await apiFetch<Agent[]>(`/api/agents${query}`);
    if (res.success) {
      setAgents(res.data);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">Collation Agents</h1>
        <p className="mt-2 text-muted max-w-xl">Agents assigned to record and submit results at each polling unit.</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          type="search"
          placeholder="Search by name or email…"
          className="w-full rounded-full border border-line px-4 py-2.5 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && agents.length === 0 ? (
        <EmptyState title="No agents found" message="Try a different search term." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 sm:px-5 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 sm:px-5 py-3 font-medium">Polling Unit</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-line last:border-b-0">
                        <td className="px-4 sm:px-5 py-3.5" colSpan={4}>
                          <div className="skeleton h-4 w-full" />
                        </td>
                      </tr>
                    ))
                  : agents.map((a) => (
                      <tr key={a.nameId} className="border-b border-line last:border-b-0 hover:bg-forest/[0.03]">
                        <td className="px-4 sm:px-5 py-3.5 font-medium text-ink whitespace-nowrap">
                          {a.firstname} {a.lastname}
                        </td>
                        <td className="px-4 py-3.5 text-muted whitespace-nowrap">{a.phone}</td>
                        <td className="px-4 py-3.5 text-muted truncate max-w-[180px]">{a.email || "—"}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-muted whitespace-nowrap">
                          {a.pollingUnit ? a.pollingUnit.name : "Unassigned"}
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
