import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());

  // Allow the deployed Vercel frontend (production) and localhost (development).
  const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000"];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(apiRateLimiter);

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
