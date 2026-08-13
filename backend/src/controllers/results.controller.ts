import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, okPaginated, parsePagination, buildPagination } from "../utils/apiResponse";

// GET /api/results — server-side paginated, filterable results across polling-unit results
export const listResults = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const party = req.query.party ? String(req.query.party).toUpperCase() : undefined;
  const lgaId = req.query.lga ? parseInt(String(req.query.lga), 10) : undefined;
  const stateId = req.query.state ? parseInt(String(req.query.state), 10) : undefined;
  const wardUniqueId = req.query.ward ? parseInt(String(req.query.ward), 10) : undefined;
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";
  const sortBy = req.query.sortBy === "date" ? "dateEntered" : "partyScore";

  const where = {
    ...(party ? { partyAbbreviation: party } : {}),
    pollingUnit: {
      ...(lgaId ? { lgaId } : {}),
      ...(stateId ? { lga: { stateId } } : {}),
      ...(wardUniqueId ? { uniqueWardId: wardUniqueId } : {}),
    },
  };

  const [total, results] = await Promise.all([
    prisma.announcedPuResult.count({ where }),
    prisma.announcedPuResult.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDir },
      include: {
        pollingUnit: {
          include: { lga: { include: { state: true } }, ward: true },
        },
      },
    }),
  ]);

  okPaginated(
    res,
    results.map((r) => ({
      resultId: r.resultId,
      party: r.partyAbbreviation,
      votes: r.partyScore,
      dateEntered: r.dateEntered,
      pollingUnitId: r.pollingUnit.uniqueId,
      pollingUnitName: r.pollingUnit.pollingUnitName || `PU ${r.pollingUnit.pollingUnitId}`,
      wardName: r.pollingUnit.ward?.wardName ?? null,
      lgaName: r.pollingUnit.lga.lgaName,
      stateName: r.pollingUnit.lga.state.stateName,
    })),
    buildPagination(page, limit, total)
  );
});

// GET /api/results/summary — overall totals for the results table header/cards
export const getResultsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [puAgg, lgaAgg, puCount, lgaCount, partyCount] = await Promise.all([
    prisma.announcedPuResult.aggregate({ _sum: { partyScore: true }, _count: true }),
    prisma.announcedLgaResult.aggregate({ _sum: { partyScore: true }, _count: true }),
    prisma.pollingUnit.count(),
    prisma.lga.count(),
    prisma.party.count(),
  ]);

  ok(res, {
    totalPuVotes: puAgg._sum.partyScore || 0,
    totalPuResultRows: puAgg._count,
    totalLgaVotes: lgaAgg._sum.partyScore || 0,
    totalLgaResultRows: lgaAgg._count,
    totalPollingUnits: puCount,
    totalLgas: lgaCount,
    totalParties: partyCount,
  });
});
