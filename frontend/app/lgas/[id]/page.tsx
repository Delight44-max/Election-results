"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { LgaResults } from "@/types";
import TallySheet from "@/components/TallySheet";
import { SkeletonTallySheet } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import LgaPerformanceChart from "@/components/charts/LgaPerformanceChart";

export default function LgaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<LgaResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<LgaResults>(`/api/lgas/${id}/results`);
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
      <Link href="/lgas" className="text-sm text-forest hover:text-forest-dark inline-flex items-center gap-1 mb-6">
        ← Back to LGAs
      </Link>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading || !data ? (
        <SkeletonTallySheet />
      ) : (
        <>
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-forest">Local Government Area</p>
            <h1 className="mt-1 font-display font-semibold text-2xl sm:text-3xl text-ink">{data.lga.lgaName}</h1>
          </div>

          <TallySheet
            title="Party Standings"
            subtitle="Aggregated from LGA return sheets"
            totalVotes={data.totalVotes}
            winner={data.winner}
            standings={data.standings}
          />

          {data.standings.length > 0 && (
            <div className="card p-5 sm:p-6 mt-5">
              <h2 className="font-display font-semibold text-lg text-ink mb-4">Vote Distribution</h2>
              <LgaPerformanceChart
                data={data.standings.map((s) => ({ lgaId: 0, lgaName: s.party, totalVotes: s.votes, winner: null }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
