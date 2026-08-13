"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { SearchResults } from "@/types";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [data, setData] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!q) return;
    setLoading(true);
    setError(null);
    const res = await apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`);
    if (res.success) setData(res.data);
    else setError(res.error.message);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const groups = data
    ? [
        { label: "States", items: data.results.states.map((s) => ({ key: `s${s.stateId}`, name: s.name, href: `/lgas?state=${s.stateId}`, meta: "State" })) },
        { label: "LGAs", items: data.results.lgas.map((l) => ({ key: `l${l.uniqueId}`, name: l.name, href: `/lgas/${l.uniqueId}`, meta: l.stateName })) },
        { label: "Wards", items: data.results.wards.map((w) => ({ key: `w${w.uniqueId}`, name: w.name, href: `/polling-units?ward=${w.uniqueId}`, meta: w.lgaName })) },
        {
          label: "Polling Units",
          items: data.results.pollingUnits.map((p) => ({ key: `p${p.uniqueId}`, name: p.name, href: `/polling-units/${p.uniqueId}`, meta: p.lgaName })),
        },
        { label: "Parties", items: data.results.parties.map((p) => ({ key: `pt${p.partyId}`, name: p.name, href: `/parties/${p.partyId}`, meta: p.partyId })) },
      ]
    : [];

  const totalResults = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-forest">Search Results</p>
        <h1 className="mt-1 font-display font-semibold text-2xl sm:text-3xl text-ink">
          {q ? `"${q}"` : "Search"}
        </h1>
      </div>

      {!q ? (
        <EmptyState title="Type something to search" message="Search across states, LGAs, wards, polling units, and parties." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 skeleton h-14" />
          ))}
        </div>
      ) : totalResults === 0 ? (
        <EmptyState title="No matches found" message={`Nothing matched "${q}". Try a shorter or different term.`} />
      ) : (
        <div className="space-y-6">
          {groups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.label}>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-2.5">{g.label}</h2>
                <div className="card divide-y divide-line overflow-hidden">
                  {g.items.map((item) => (
                    <Link key={item.key} href={item.href} className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-forest/[0.03]">
                      <span className="text-sm font-medium text-ink">{item.name}</span>
                      <span className="text-xs text-muted">{item.meta}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-10 text-muted text-sm">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
