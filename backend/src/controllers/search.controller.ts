import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, fail } from "../utils/apiResponse";

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();
  if (!q) return fail(res, "Query parameter 'q' is required", 400);

  const mode = "insensitive" as const;

  const [states, lgas, wards, pollingUnits, parties] = await Promise.all([
    prisma.state.findMany({ where: { stateName: { contains: q, mode } }, take: 5 }),
    prisma.lga.findMany({ where: { lgaName: { contains: q, mode } }, take: 5, include: { state: true } }),
    prisma.ward.findMany({ where: { wardName: { contains: q, mode } }, take: 5, include: { lga: true } }),
    prisma.pollingUnit.findMany({
      where: {
        OR: [
          { pollingUnitName: { contains: q, mode } },
          { pollingUnitNumber: { contains: q, mode } },
        ],
      },
      take: 8,
      include: { lga: true, ward: true },
    }),
    prisma.party.findMany({
      where: { OR: [{ partyId: { contains: q, mode } }, { partyName: { contains: q, mode } }] },
      take: 5,
    }),
  ]);

  ok(res, {
    query: q,
    results: {
      states: states.map((s) => ({ type: "state", stateId: s.stateId, name: s.stateName })),
      lgas: lgas.map((l) => ({ type: "lga", uniqueId: l.uniqueId, name: l.lgaName, stateName: l.state.stateName })),
      wards: wards.map((w) => ({ type: "ward", uniqueId: w.uniqueId, name: w.wardName, lgaName: w.lga.lgaName })),
      pollingUnits: pollingUnits.map((p) => ({
        type: "pollingUnit",
        uniqueId: p.uniqueId,
        name: p.pollingUnitName || `PU ${p.pollingUnitId}`,
        lgaName: p.lga.lgaName,
        wardName: p.ward?.wardName ?? null,
      })),
      parties: parties.map((p) => ({ type: "party", partyId: p.partyId, name: p.partyName })),
    },
  });
});
