import request from "supertest";
import { createApp } from "../app";

describe("GET /api/health", () => {
  it("returns success:true", async () => {
    const app = createApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /api/results", () => {
  it("returns a paginated envelope", async () => {
    const app = createApp();
    const res = await request(app).get("/api/results?page=1&limit=5");
    expect(res.body).toHaveProperty("success");
    if (res.body.success) {
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});

describe("GET /api/search", () => {
  it("requires a q parameter", async () => {
    const app = createApp();
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("404 handler", () => {
  it("returns a structured error for unknown routes", async () => {
    const app = createApp();
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
