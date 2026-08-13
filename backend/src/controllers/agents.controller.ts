import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { okPaginated, parsePagination, buildPagination } from "../utils/apiResponse";

export const listAgents = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const search = req.query.search ? String(req.query.search) : undefined;

  const where = search
    ? {
        OR: [
          { firstname: { contains: search, mode: "insensitive" as const } },
          { lastname: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, agents] = await Promise.all([
    prisma.agentName.count({ where }),
    prisma.agentName.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nameId: "asc" },
      include: {
        pollingUnit: { select: { pollingUnitName: true, pollingUnitId: true, uniqueId: true } },
      },
    }),
  ]);

  okPaginated(
    res,
    agents.map((a) => ({
      nameId: a.nameId,
      firstname: a.firstname,
      lastname: a.lastname,
      email: a.email,
      phone: a.phone,
      pollingUnit: a.pollingUnit
        ? {
            uniqueId: a.pollingUnit.uniqueId,
            name: a.pollingUnit.pollingUnitName || `PU ${a.pollingUnit.pollingUnitId}`,
          }
        : null,
    })),
    buildPagination(page, limit, total)
  );
});
