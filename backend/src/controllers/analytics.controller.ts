import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

// GET /api/analytics/overview — dashboard statistics cards
export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalStates,
    totalLgas,
    totalWards,
    totalPollingUnits,
    totalParties,
    puAgg,
    lgaAgg,
    agentCount,
  ] = await Promise.all([
    prisma.state.count(),
    prisma.lga.count(),
    prisma.ward.count(),
    prisma.pollingUnit.count(),
    prisma.party.count(),
    prisma.announcedPuResult.aggregate({ _sum: { partyScore: true }, _count: true }),
    prisma.announcedLgaResult.aggregate({ _sum: { partyScore: true }, _count: true }),
    prisma.agentName.count(),
  ]);

  ok(res, {
    totalStates,
    totalLgas,
    totalWards,
    totalPollingUnits,
    totalParties,
    totalAgents: agentCount,
    totalVotesRecorded: (puAgg._sum.partyScore || 0) + (lgaAgg._sum.partyScore || 0),
    puVotesRecorded: puAgg._sum.partyScore || 0,
    lgaVotesRecorded: lgaAgg._sum.partyScore || 0,
    resultsEntered: puAgg._count + lgaAgg._count,
  });
});

// GET /api/analytics/parties — votes by party, percentage distribution, winning parties
export const getPartyAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [puTotals, lgaTotals] = await Promise.all([
    prisma.announcedPuResult.groupBy({ by: ["partyAbbreviation"], _sum: { partyScore: true } }),
    prisma.announcedLgaResult.groupBy({ by: ["partyAbbreviation"], _sum: { partyScore: true } }),
  ]);

  const combined = new Map<string, number>();
  for (const t of puTotals) combined.set(t.partyAbbreviation, (combined.get(t.partyAbbreviation) || 0) + (t._sum.partyScore || 0));
  for (const t of lgaTotals) combined.set(t.partyAbbreviation, (combined.get(t.partyAbbreviation) || 0) + (t._sum.partyScore || 0));

  const total = [...combined.values()].reduce((a, b) => a + b, 0);
  const byParty = [...combined.entries()]
    .map(([party, votes]) => ({
      party,
      votes,
      percentage: total > 0 ? Number(((votes / total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  ok(res, { totalVotes: total, byParty });
});

// GET /api/analytics/lgas — votes by LGA, winning party per LGA
export const getLgaAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const results = await prisma.announcedLgaResult.findMany({ include: { lga: true } });

  const byLga = new Map<number, { lgaName: string; totals: Map<string, number> }>();
  for (const r of results) {
    if (!byLga.has(r.lgaId)) byLga.set(r.lgaId, { lgaName: r.lga.lgaName, totals: new Map() });
    const entry = byLga.get(r.lgaId)!;
    entry.totals.set(r.partyAbbreviation, (entry.totals.get(r.partyAbbreviation) || 0) + r.partyScore);
  }

  const lgaSummaries = [...byLga.entries()].map(([lgaId, { lgaName, totals }]) => {
    const standings = [...totals.entries()].map(([party, votes]) => ({ party, votes })).sort((a, b) => b.votes - a.votes);
    const totalVotes = standings.reduce((s, x) => s + x.votes, 0);
    return { lgaId, lgaName, totalVotes, winner: standings[0] ?? null };
  }).sort((a, b) => b.totalVotes - a.totalVotes);

  ok(res, lgaSummaries);
});

// GET /api/analytics/coverage — how much of the location hierarchy has recorded results
export const getCoverage = asyncHandler(async (_req: Request, res: Response) => {
  const [totalLgas, lgasWithResults, totalPu, puWithResults] = await Promise.all([
    prisma.lga.count(),
    prisma.announcedLgaResult.groupBy({ by: ["lgaId"] }),
    prisma.pollingUnit.count(),
    prisma.announcedPuResult.groupBy({ by: ["pollingUnitUniqueId"] }),
  ]);

  ok(res, {
    lgaCoverage: {
      total: totalLgas,
      withResults: lgasWithResults.length,
      percentage: totalLgas > 0 ? Number(((lgasWithResults.length / totalLgas) * 100).toFixed(1)) : 0,
    },
    pollingUnitCoverage: {
      total: totalPu,
      withResults: puWithResults.length,
      percentage: totalPu > 0 ? Number(((puWithResults.length / totalPu) * 100).toFixed(1)) : 0,
    },
  });
});

// GET /api/analytics/top-polling-units — top PUs by total votes recorded
export const getTopPollingUnits = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));

  const grouped = await prisma.announcedPuResult.groupBy({
    by: ["pollingUnitUniqueId"],
    _sum: { partyScore: true },
    orderBy: { _sum: { partyScore: "desc" } },
    take: limit,
  });

  const units = await prisma.pollingUnit.findMany({
    where: { uniqueId: { in: grouped.map((g) => g.pollingUnitUniqueId) } },
    include: { lga: true, ward: true },
  });
  const unitMap = new Map(units.map((u) => [u.uniqueId, u]));

  ok(
    res,
    grouped.map((g) => {
      const u = unitMap.get(g.pollingUnitUniqueId);
      return {
        pollingUnitId: g.pollingUnitUniqueId,
        name: u?.pollingUnitName || `PU ${u?.pollingUnitId ?? g.pollingUnitUniqueId}`,
        lgaName: u?.lga.lgaName ?? null,
        wardName: u?.ward?.wardName ?? null,
        totalVotes: g._sum.partyScore || 0,
      };
    })
  );
});
