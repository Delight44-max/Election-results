import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a positive integer"),
});

export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const resultsQuerySchema = paginationQuerySchema.extend({
  state: z.string().regex(/^\d+$/).optional(),
  lga: z.string().regex(/^\d+$/).optional(),
  ward: z.string().regex(/^\d+$/).optional(),
  party: z.string().max(10).optional(),
  sortBy: z.enum(["date", "score"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, "q is required"),
});
