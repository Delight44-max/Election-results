"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { PollingUnitResults } from "@/types";
import TallySheet from "@/components/TallySheet";
import { SkeletonTallySheet } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import PartyVoteChart from "@/components/charts/PartyVoteChart";

export default function PollingUnitDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<PollingUnitResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<PollingUnitResults>(`/api/polling-units/${id}/results`);
    if (res.success) setData(res.data);
    else setError(res.error.message);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link href="/polling-units" className="text-sm text-forest hover:text-forest-dark inline-flex items-center gap-1 mb-6">
        ← Back to Polling Unit Search
      </Link>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading || !data ? (
        <SkeletonTallySheet />
      ) : (
        <>
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-forest">Polling Unit</p>
            <h1 className="mt-1 font-display font-semibold text-2xl sm:text-3xl text-ink">
              {data.pollingUnit.pollingUnitName}
            </h1>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Unit No.</dt>
                <dd className="text-ink mt-0.5">{data.pollingUnit.pollingUnitNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Ward</dt>
                <dd className="text-ink mt-0.5">{data.pollingUnit.wardName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">LGA</dt>
                <dd className="text-ink mt-0.5">{data.pollingUnit.lgaName}</dd>
              </div>
            </dl>
          </div>

          <TallySheet
            title="Election Results"
            subtitle="As recorded by collation agents at this unit"
            totalVotes={data.totalVotes}
            winner={data.winner}
            standings={data.standings}
          />

          {data.standings.length > 0 && (
            <div className="card p-5 sm:p-6 mt-5">
              <h2 className="font-display font-semibold text-lg text-ink mb-4">Vote Breakdown</h2>
              <PartyVoteChart data={data.standings.map((s) => ({ party: s.party, votes: s.votes, percentage: s.percentage }))} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
