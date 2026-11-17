import type { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { anonApp, authedApp, connectTestDb, disconnectTestDb, viewerApp } from "./helpers";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await connectTestDb();
}, 120_000);

afterAll(async () => {
  await disconnectTestDb(mongod);
});

describe("auth gate", () => {
  it("allows unauthenticated access to /api/health", async () => {
    const res = await request(anonApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated requests to protected routes", async () => {
    const app = anonApp();
    const responses = await Promise.all(
      ["/api/doctors", "/api/patients", "/api/stats", "/api/me"].map((path) =>
        request(app).get(path),
      ),
    );
    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    }
  });

  it("accepts requests when a session exists", async () => {
    const res = await request(authedApp()).get("/api/doctors");
    expect(res.status).toBe(200);
  });

  it("exposes the session user on /api/me", async () => {
    const res = await request(authedApp()).get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("admin@example.com");
  });
});

describe("role gate", () => {
  it("allows viewers to read every resource", async () => {
    const app = viewerApp();
    const responses = await Promise.all(
      ["/api/doctors", "/api/patients", "/api/stats", "/api/me"].map((path) =>
        request(app).get(path),
      ),
    );
    for (const res of responses) {
      expect(res.status).toBe(200);
    }
  });

  it("forbids viewers from doctor mutations", async () => {
    const app = viewerApp();
    const responses = await Promise.all([
      request(app).post("/api/doctors").send({ name: "Dr. X" }),
      request(app).patch("/api/doctors/abc").send({ name: "Dr. Y" }),
      request(app).delete("/api/doctors/abc"),
    ]);
    for (const res of responses) {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden — admin role required");
    }
  });

  it("forbids viewers from patient mutations", async () => {
    const app = viewerApp();
    const responses = await Promise.all([
      request(app).post("/api/patients").send({ name: "Pat" }),
      request(app).patch("/api/patients/abc").send({ name: "Pat" }),
      request(app).delete("/api/patients/abc"),
    ]);
    for (const res of responses) {
      expect(res.status).toBe(403);
    }
  });
});
