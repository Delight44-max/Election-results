import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, fail } from "../utils/apiResponse";

export const listStates = asyncHandler(async (_req: Request, res: Response) => {
  const states = await prisma.state.findMany({
    orderBy: { stateName: "asc" },
    include: { _count: { select: { lgas: true } } },
  });
  ok(
    res,
    states.map((s) => ({
      stateId: s.stateId,
      stateName: s.stateName,
      lgaCount: s._count.lgas,
    }))
  );
});

export const getState = asyncHandler(async (req: Request, res: Response) => {
  const stateId = parseInt(req.params.id, 10);
  const state = await prisma.state.findUnique({
    where: { stateId },
    include: { lgas: { orderBy: { lgaName: "asc" } } },
  });
  if (!state) return fail(res, "State not found", 404);
  ok(res, state);
});
