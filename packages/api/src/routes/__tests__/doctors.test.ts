import { Patient } from "@doctor-tracker/db/models/patient.model";
import type { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  authedApp,
  clearCollections,
  connectTestDb,
  disconnectTestDb,
  makeDoctor,
  makePatient,
  seedDoctor,
  seedDoctors,
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

const validDoctor = {
  email: "gregory.house@example.com",
  hospital: "Princeton-Plainsboro",
  name: "Dr. Gregory House",
  phone: "+1 555-0142",
  specialization: "Diagnostics",
};

describe("POST /api/doctors", () => {
  it("creates a doctor and returns it with patientCount 0", async () => {
    const res = await request(authedApp()).post("/api/doctors").send(validDoctor);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.name).toBe(validDoctor.name);
    expect(res.body.patientCount).toBe(0);
    expect(res.body._id).toBeUndefined();
    expect(res.body.__v).toBeUndefined();
    expect(res.body.createdAt).toBeTypeOf("string");
  });

  it("rejects a body missing email", async () => {
    const { email: _email, ...withoutEmail } = validDoctor;
    const res = await request(authedApp()).post("/api/doctors").send(withoutEmail);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(Array.isArray(res.body.issues)).toBe(true);
  });

  it("rejects an invalid email format", async () => {
    const res = await request(authedApp())
      .post("/api/doctors")
      .send({ ...validDoctor, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});

describe("GET /api/doctors", () => {
  it("returns an empty page when no doctors exist", async () => {
    const res = await request(authedApp()).get("/api/doctors");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [],
      limit: 10,
      page: 1,
      total: 0,
      totalPages: 0,
    });
  });

  it("paginates 25 doctors across 3 pages", async () => {
    const docs = Array.from({ length: 25 }, (_, i) => makeDoctor(i));
    await seedDoctors(docs);

    const app = authedApp();
    const page1 = await request(app).get("/api/doctors?limit=10&page=1");
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.total).toBe(25);
    expect(page1.body.totalPages).toBe(3);
    expect(page1.body.page).toBe(1);
    expect(page1.body.limit).toBe(10);

    const page3 = await request(app).get("/api/doctors?limit=10&page=3");
    expect(page3.body.data).toHaveLength(5);
  });

  it("clamps limit at 50", async () => {
    await seedDoctor(0);
    const res = await request(authedApp()).get("/api/doctors?limit=200");
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });

  it("rejects page < 1", async () => {
    const res = await request(authedApp()).get("/api/doctors?page=0");
    expect(res.status).toBe(400);
  });

  it("searches case-insensitively across fields", async () => {
    await seedDoctors([
      makeDoctor(0, { name: "Dr. Heart", specialization: "Cardiology" }),
      makeDoctor(1, { name: "Dr. Brain", specialization: "Neurology" }),
    ]);
    const res = await request(authedApp()).get("/api/doctors?search=cardio");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe("Dr. Heart");
  });

  it("filters by exact specialization", async () => {
    await seedDoctors([
      makeDoctor(0, { specialization: "Cardiology" }),
      makeDoctor(1, { specialization: "Neurology" }),
    ]);
    const res = await request(authedApp()).get("/api/doctors?specialization=Neurology");
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].specialization).toBe("Neurology");
  });

  it("sorts by name:asc and rejects invalid sort fields", async () => {
    await seedDoctors([makeDoctor(0, { name: "Zed" }), makeDoctor(1, { name: "Alpha" })]);
    const app = authedApp();
    const res = await request(app).get("/api/doctors?sort=name:asc");
    expect(res.body.data[0].name).toBe("Alpha");

    const bad = await request(app).get("/api/doctors?sort=evil:desc");
    expect(bad.status).toBe(400);
  });

  it("includes patientCount per doctor", async () => {
    const doc = await seedDoctor(0);
    await seedPatients([makePatient(0, doc.id), makePatient(1, doc.id)]);
    const res = await request(authedApp()).get("/api/doctors");
    expect(res.body.data[0].patientCount).toBe(2);
  });
});

describe("GET /api/doctors/specializations", () => {
  it("returns sorted distinct specializations", async () => {
    await seedDoctors([
      makeDoctor(0, { specialization: "Neurology" }),
      makeDoctor(1, { specialization: "Cardiology" }),
      makeDoctor(2, { specialization: "Cardiology" }),
    ]);
    const res = await request(authedApp()).get("/api/doctors/specializations");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(["Cardiology", "Neurology"]);
  });
});

describe("GET /api/doctors/:id", () => {
  it("returns a doctor with patientCount", async () => {
    const doc = await seedDoctor(0);
    await seedPatients([makePatient(0, doc.id)]);
    const res = await request(authedApp()).get(`/api/doctors/${doc.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(doc.id);
    expect(res.body.patientCount).toBe(1);
    expect(res.body._id).toBeUndefined();
  });

  it("404s on a missing doctor", async () => {
    const res = await request(authedApp()).get(
      `/api/doctors/${new mongoose.Types.ObjectId().toString()}`,
    );
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Doctor not found" });
  });
});

describe("PATCH /api/doctors/:id", () => {
  it("updates fields partially", async () => {
    const doc = await seedDoctor(0);
    const res = await request(authedApp())
      .patch(`/api/doctors/${doc.id}`)
      .send({ hospital: "New Hospital" });
    expect(res.status).toBe(200);
    expect(res.body.hospital).toBe("New Hospital");
    expect(res.body.name).toBe(doc.name);
  });

  it("404s on a missing doctor", async () => {
    const res = await request(authedApp())
      .patch(`/api/doctors/${makeDoctor(99).id}`)
      .send({ hospital: "XX" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/doctors/:id", () => {
  it("deletes the doctor and cascades to their patients", async () => {
    const doc = await seedDoctor(0);
    await seedPatients([makePatient(0, doc.id), makePatient(1, doc.id)]);

    const res = await request(authedApp()).delete(`/api/doctors/${doc.id}`);
    expect(res.status).toBe(204);

    const after = await request(authedApp()).get(`/api/doctors/${doc.id}`);
    expect(after.status).toBe(404);
    expect(await Patient.countDocuments({ doctorId: doc.id })).toBe(0);
  });

  it("404s on a missing doctor", async () => {
    const res = await request(authedApp()).delete(`/api/doctors/${makeDoctor(99).id}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/doctors/:id/patients", () => {
  it("returns patients scoped to the doctor", async () => {
    const doc = await seedDoctor(0);
    const other = await seedDoctor(1);
    await seedPatients([
      makePatient(0, doc.id, { condition: "Asthma", name: "Wheezy One" }),
      makePatient(1, doc.id, { condition: "Anemia", name: "Pale Two" }),
      makePatient(2, other.id, { condition: "Asthma", name: "Other Guy" }),
    ]);

    const res = await request(authedApp()).get(`/api/doctors/${doc.id}/patients`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    for (const patient of res.body.data) {
      expect(patient.doctorId).toBe(doc.id);
      expect(patient.doctor.id).toBe(doc.id);
    }

    const filtered = await request(authedApp()).get(
      `/api/doctors/${doc.id}/patients?condition=Asthma`,
    );
    expect(filtered.body.total).toBe(1);
  });

  it("404s when the doctor does not exist", async () => {
    const res = await request(authedApp()).get(`/api/doctors/${makeDoctor(99).id}/patients`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Doctor not found" });
  });
});
