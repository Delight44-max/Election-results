import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, fail, okPaginated, parsePagination, buildPagination } from "../utils/apiResponse";

export const listPollingUnits = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const lgaId = req.query.lga ? parseInt(String(req.query.lga), 10) : undefined;
  const wardUniqueId = req.query.ward ? parseInt(String(req.query.ward), 10) : undefined;
  const stateId = req.query.state ? parseInt(String(req.query.state), 10) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;

  const where = {
    ...(lgaId ? { lgaId } : {}),
    ...(wardUniqueId ? { uniqueWardId: wardUniqueId } : {}),
    ...(stateId ? { lga: { stateId } } : {}),
    ...(search
      ? {
          OR: [
            { pollingUnitName: { contains: search, mode: "insensitive" as const } },
            { pollingUnitNumber: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, units] = await Promise.all([
    prisma.pollingUnit.count({ where }),
    prisma.pollingUnit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { uniqueId: "asc" },
      include: {
        lga: { select: { lgaName: true, state: { select: { stateName: true } } } },
        ward: { select: { wardName: true } },
      },
    }),
  ]);

  okPaginated(
    res,
    units.map((u) => ({
      uniqueId: u.uniqueId,
      pollingUnitId: u.pollingUnitId,
      pollingUnitNumber: u.pollingUnitNumber,
      pollingUnitName: u.pollingUnitName || `Polling Unit ${u.pollingUnitId}`,
      wardName: u.ward?.wardName ?? null,
      lgaName: u.lga.lgaName,
      stateName: u.lga.state.stateName,
    })),
    buildPagination(page, limit, total)
  );
});

export const getPollingUnit = asyncHandler(async (req: Request, res: Response) => {
  const uniqueId = parseInt(req.params.id, 10);
  const unit = await prisma.pollingUnit.findUnique({
    where: { uniqueId },
    include: { lga: { include: { state: true } }, ward: true },
  });
  if (!unit) return fail(res, "Polling unit not found", 404);
  ok(res, unit);
});

export const getPollingUnitResults = asyncHandler(async (req: Request, res: Response) => {
  const uniqueId = parseInt(req.params.id, 10);
  const unit = await prisma.pollingUnit.findUnique({
    where: { uniqueId },
    include: { lga: true, ward: true },
  });
  if (!unit) return fail(res, "Polling unit not found", 404);

  const results = await prisma.announcedPuResult.findMany({
    where: { pollingUnitUniqueId: uniqueId },
    orderBy: { partyScore: "desc" },
  });

  const totalVotes = results.reduce((sum, r) => sum + r.partyScore, 0);
  const standings = results.map((r) => ({
    party: r.partyAbbreviation,
    votes: r.partyScore,
    percentage: totalVotes > 0 ? Number(((r.partyScore / totalVotes) * 100).toFixed(2)) : 0,
  }));

  ok(res, {
    pollingUnit: {
      uniqueId: unit.uniqueId,
      pollingUnitName: unit.pollingUnitName || `Polling Unit ${unit.pollingUnitId}`,
      pollingUnitNumber: unit.pollingUnitNumber,
      wardName: unit.ward?.wardName ?? null,
      lgaName: unit.lga.lgaName,
    },
    totalVotes,
    winner: standings[0] ?? null,
    standings,
  });
});
