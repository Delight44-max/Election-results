import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "10000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "https://github.com/Delight44-max/Election-results.git",
  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[config] DATABASE_URL is not set. Set it in backend/.env (see .env.example)."
  );
}
