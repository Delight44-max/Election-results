import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, fail, okPaginated, parsePagination, buildPagination } from "../utils/apiResponse";

export const listLgas = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const stateId = req.query.state ? parseInt(String(req.query.state), 10) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;

  const where = {
    ...(stateId ? { stateId } : {}),
    ...(search ? { lgaName: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [total, lgas] = await Promise.all([
    prisma.lga.count({ where }),
    prisma.lga.findMany({
      where,
      skip,
      take: limit,
      orderBy: { lgaName: "asc" },
      include: {
        state: { select: { stateName: true } },
        _count: { select: { wards: true, pollingUnits: true } },
      },
    }),
  ]);

  okPaginated(
    res,
    lgas.map((l) => ({
      uniqueId: l.uniqueId,
      lgaId: l.lgaId,
      lgaName: l.lgaName,
      stateName: l.state.stateName,
      wardCount: l._count.wards,
      pollingUnitCount: l._count.pollingUnits,
    })),
    buildPagination(page, limit, total)
  );
});

export const getLga = asyncHandler(async (req: Request, res: Response) => {
  const uniqueId = parseInt(req.params.id, 10);
  const lga = await prisma.lga.findUnique({
    where: { uniqueId },
    include: {
      state: true,
      _count: { select: { wards: true, pollingUnits: true } },
    },
  });
  if (!lga) return fail(res, "LGA not found", 404);
  ok(res, lga);
});

export const getLgaResults = asyncHandler(async (req: Request, res: Response) => {
  const uniqueId = parseInt(req.params.id, 10);
  const lga = await prisma.lga.findUnique({ where: { uniqueId } });
  if (!lga) return fail(res, "LGA not found", 404);

  const results = await prisma.announcedLgaResult.groupBy({
    by: ["partyAbbreviation"],
    where: { lgaId: lga.lgaId },
    _sum: { partyScore: true },
    orderBy: { _sum: { partyScore: "desc" } },
  });

  const totalVotes = results.reduce((sum, r) => sum + (r._sum.partyScore || 0), 0);
  const standings = results.map((r) => ({
    party: r.partyAbbreviation,
    votes: r._sum.partyScore || 0,
    percentage: totalVotes > 0 ? Number((((r._sum.partyScore || 0) / totalVotes) * 100).toFixed(2)) : 0,
  }));

  ok(res, {
    lga: { uniqueId: lga.uniqueId, lgaId: lga.lgaId, lgaName: lga.lgaName },
    totalVotes,
    winner: standings[0] ?? null,
    standings,
  });
});
