import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, fail } from "../utils/apiResponse";

export const listParties = asyncHandler(async (_req: Request, res: Response) => {
  const parties = await prisma.party.findMany({ orderBy: { partyId: "asc" } });

  // Aggregate total votes per party across both PU and LGA result tables for a quick overview.
  const [puTotals, lgaTotals] = await Promise.all([
    prisma.announcedPuResult.groupBy({ by: ["partyAbbreviation"], _sum: { partyScore: true } }),
    prisma.announcedLgaResult.groupBy({ by: ["partyAbbreviation"], _sum: { partyScore: true } }),
  ]);

  const puMap = new Map(puTotals.map((p) => [p.partyAbbreviation, p._sum.partyScore || 0]));

  ok(
    res,
    parties.map((p) => ({
      ...p,
      totalPuVotes: puMap.get(p.partyId) || 0,
      totalLgaVotes: lgaTotals.find((l) => l.partyAbbreviation === p.partyId)?._sum.partyScore || 0,
    }))
  );
});

export const getPartyResults = asyncHandler(async (req: Request, res: Response) => {
  const partyAbbreviation = req.params.party.toUpperCase();
  const party = await prisma.party.findUnique({ where: { partyId: partyAbbreviation } });
  if (!party) return fail(res, "Party not found", 404);

  const [puResults, lgaResults, allPuTotals] = await Promise.all([
    prisma.announcedPuResult.findMany({
      where: { partyAbbreviation },
      include: {
        pollingUnit: { include: { lga: true, ward: true } },
      },
      orderBy: { partyScore: "desc" },
    }),
    prisma.announcedLgaResult.findMany({
      where: { partyAbbreviation },
      include: { lga: true },
      orderBy: { partyScore: "desc" },
    }),
    prisma.announcedPuResult.aggregate({ _sum: { partyScore: true } }),
  ]);

  const totalPuVotes = puResults.reduce((s, r) => s + r.partyScore, 0);
  const totalLgaVotes = lgaResults.reduce((s, r) => s + r.partyScore, 0);
  const grandTotalPuVotes = allPuTotals._sum.partyScore || 0;

  // Determine LGAs won by this party (highest score per LGA among LGA results)
  const allLgaResults = await prisma.announcedLgaResult.findMany({ include: { lga: true } });
  const byLga = new Map<number, { party: string; score: number }[]>();
  for (const r of allLgaResults) {
    const arr = byLga.get(r.lgaId) || [];
    arr.push({ party: r.partyAbbreviation, score: r.partyScore });
    byLga.set(r.lgaId, arr);
  }
  let lgasWon = 0;
  for (const [, scores] of byLga) {
    const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
    if (top.party === partyAbbreviation) lgasWon++;
  }

  // Polling units won
  const allPuResults = await prisma.announcedPuResult.findMany();
  const byPu = new Map<number, { party: string; score: number }[]>();
  for (const r of allPuResults) {
    const arr = byPu.get(r.pollingUnitUniqueId) || [];
    arr.push({ party: r.partyAbbreviation, score: r.partyScore });
    byPu.set(r.pollingUnitUniqueId, arr);
  }
  let pollingUnitsWon = 0;
  for (const [, scores] of byPu) {
    const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
    if (top.party === partyAbbreviation) pollingUnitsWon++;
  }

  const strongestLga = lgaResults[0]
    ? { name: lgaResults[0].lga.lgaName, votes: lgaResults[0].partyScore }
    : null;
  const strongestPu = puResults[0]
    ? {
        name: puResults[0].pollingUnit.pollingUnitName || `PU ${puResults[0].pollingUnit.pollingUnitId}`,
        votes: puResults[0].partyScore,
      }
    : null;

  ok(res, {
    party,
    totalPuVotes,
    totalLgaVotes,
    lgasWon,
    pollingUnitsWon,
    percentageOfPuVotes: grandTotalPuVotes > 0 ? Number(((totalPuVotes / grandTotalPuVotes) * 100).toFixed(2)) : 0,
    strongestLga,
    strongestPollingUnit: strongestPu,
  });
});
