import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

// Centralized error handler — never leaks stack traces in production.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const isProd = process.env.NODE_ENV === "production";

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: { message: "Record not found" } });
    }
    return res.status(400).json({
      success: false,
      error: { message: "Database request error", ...(isProd ? {} : { code: err.code }) },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, error: { message: err.message } });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      ...(isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
    },
  });
}
