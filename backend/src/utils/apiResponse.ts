import { Response } from "express";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function okPaginated<T>(
  res: Response,
  data: T,
  pagination: Pagination,
  status = 200
) {
  return res.status(status).json({ success: true, data, pagination });
}

export function fail(res: Response, message: string, status = 400, details?: unknown) {
  return res.status(status).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
}

export function buildPagination(page: number, limit: number, total: number): Pagination {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? "20"), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
