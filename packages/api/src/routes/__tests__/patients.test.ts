import type { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  authedApp,
  clearCollections,
  connectTestDb,
  disconnectTestDb,
  makePatient,
  seedDoctor,
  seedPatient,
  seedPatients,
} from "./helpers";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await connectTestDb();
}, 120_000);

afterAll(async () => {
  await disconnectTestDb(mongod);
});

beforeEach(clearCollections);

describe("POST /api/patients", () => {
  it("creates a patient with an embedded doctor", async () => {
    const doctor = await seedDoctor();
    const res = await request(authedApp())
      .post("/api/patients")
      .send({ condition: "Asthma", doctorId: doctor.id, name: "Jane Doe" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.doctorId).toBe(doctor.id);
    expect(res.body.doctor).toEqual({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
    });
    expect(res.body._id).toBeUndefined();
    expect(res.body.__v).toBeUndefined();
  });

  it("404s when doctorId does not reference a doctor", async () => {
    const res = await request(authedApp())
      .post("/api/patients")
      .send({ condition: "Asthma", doctorId: "missing", name: "Jane Doe" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Doctor not found" });
  });

  it("400s on missing fields", async () => {
    const res = await request(authedApp()).post("/api/patients").send({ name: "No Condition" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(Array.isArray(res.body.issues)).toBe(true);
  });
});

describe("GET /api/patients", () => {
  it("lists patients with embedded doctors", async () => {
    const doctor = await seedDoctor();
    await seedPatients([
      makePatient(0, doctor.id, { condition: "Asthma" }),
      makePatient(1, doctor.id, { condition: "Migraine" }),
    ]);
    const res = await request(authedApp()).get("/api/patients");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data[0].doctor.id).toBe(doctor.id);
  });

  it("returns doctor: null for orphaned patients", async () => {
    await seedPatient(0, "ghost-doctor");
    const res = await request(authedApp()).get("/api/patients");
    expect(res.body.data[0].doctor).toBeNull();
  });

  it("filters by condition and doctorId, searches name/condition", async () => {
    const d1 = await seedDoctor(0);
    const d2 = await seedDoctor(1);
    await seedPatients([
      makePatient(0, d1.id, { condition: "Asthma", name: "Alice" }),
      makePatient(1, d2.id, { condition: "Anemia", name: "Bob" }),
    ]);

    const app = authedApp();
    const byCondition = await request(app).get("/api/patients?condition=Asthma");
    expect(byCondition.body.total).toBe(1);
    expect(byCondition.body.data[0].name).toBe("Alice");

    const byDoctor = await request(app).get(`/api/patients?doctorId=${d2.id}`);
    expect(byDoctor.body.total).toBe(1);
    expect(byDoctor.body.data[0].name).toBe("Bob");

    const searched = await request(app).get("/api/patients?search=anemia");
    expect(searched.body.total).toBe(1);
  });

  it("filters by createdAt range with from", async () => {
    const doctor = await seedDoctor();
    const now = Date.now();
    await seedPatients([
      makePatient(0, doctor.id, {
        createdAt: new Date(now - 10 * 86_400_000),
      }),
      makePatient(1, doctor.id, {
        createdAt: new Date(now - 2 * 86_400_000),
      }),
    ]);
    const from = new Date(now - 5 * 86_400_000).toISOString();
    const res = await request(authedApp()).get(`/api/patients?from=${encodeURIComponent(from)}`);
    expect(res.body.total).toBe(1);
  });
});

describe("GET /api/patients/conditions", () => {
  it("returns sorted distinct conditions", async () => {
    const doctor = await seedDoctor();
    await seedPatients([
      makePatient(0, doctor.id, { condition: "Migraine" }),
      makePatient(1, doctor.id, { condition: "Asthma" }),
      makePatient(2, doctor.id, { condition: "Asthma" }),
    ]);
    const res = await request(authedApp()).get("/api/patients/conditions");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(["Asthma", "Migraine"]);
  });
});

describe("PATCH /api/patients/:id", () => {
  it("reassigns doctorId when the doctor exists", async () => {
    const d1 = await seedDoctor(0);
    const d2 = await seedDoctor(1);
    const patient = await seedPatient(0, d1.id);
    const res = await request(authedApp())
      .patch(`/api/patients/${patient.id}`)
      .send({ doctorId: d2.id });
    expect(res.status).toBe(200);
    expect(res.body.doctorId).toBe(d2.id);
    expect(res.body.doctor.id).toBe(d2.id);
  });

  it("404s on reassigning to a missing doctor", async () => {
    const doctor = await seedDoctor();
    const patient = await seedPatient(0, doctor.id);
    const res = await request(authedApp())
      .patch(`/api/patients/${patient.id}`)
      .send({ doctorId: "ghost" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Doctor not found" });
  });

  it("404s on a missing patient", async () => {
    const res = await request(authedApp())
      .patch(`/api/patients/${makePatient(0, "x").id}`)
      .send({ name: "New Name" });
    expect(res.status).toBe(404);
  });
});

describe("GET/DELETE /api/patients/:id", () => {
  it("gets a patient then deletes it", async () => {
    const doctor = await seedDoctor();
    const patient = await seedPatient(0, doctor.id);
    const app = authedApp();

    const got = await request(app).get(`/api/patients/${patient.id}`);
    expect(got.status).toBe(200);
    expect(got.body.doctor.id).toBe(doctor.id);

    const del = await request(app).delete(`/api/patients/${patient.id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/patients/${patient.id}`);
    expect(after.status).toBe(404);
  });
});
