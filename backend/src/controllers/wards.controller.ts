import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, okPaginated, parsePagination, buildPagination } from "../utils/apiResponse";

export const listWards = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
  const lgaId = req.query.lga ? parseInt(String(req.query.lga), 10) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;

  const where = {
    ...(lgaId ? { lgaId } : {}),
    ...(search ? { wardName: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [total, wards] = await Promise.all([
    prisma.ward.count({ where }),
    prisma.ward.findMany({
      where,
      skip,
      take: limit,
      orderBy: { wardName: "asc" },
      include: { lga: { select: { lgaName: true, uniqueId: true } } },
    }),
  ]);

  okPaginated(res, wards, buildPagination(page, limit, total));
});

export const getWard = asyncHandler(async (req: Request, res: Response) => {
  const uniqueId = parseInt(req.params.id, 10);
  const ward = await prisma.ward.findUnique({
    where: { uniqueId },
    include: { lga: { include: { state: true } }, pollingUnits: true },
  });
  if (!ward) return ok(res, null, 404);
  ok(res, ward);
});
