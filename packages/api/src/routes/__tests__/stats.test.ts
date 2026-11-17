import type { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  authedApp,
  clearCollections,
  connectTestDb,
  DAY_MS,
  disconnectTestDb,
  makePatient,
  seedDoctor,
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

const dayString = (date: Date) => date.toISOString().slice(0, 10);

describe("GET /api/stats", () => {
  it("returns the expected shape and correct counts", async () => {
    const now = Date.now();
    const docA = await seedDoctor(0, {
      createdAt: new Date(now),
      name: "Dr. Alpha",
      specialization: "Cardiology",
    });
    const docB = await seedDoctor(1, {
      createdAt: new Date(now - 5 * DAY_MS),
      name: "Dr. Beta",
      specialization: "Neurology",
    });
    const docC = await seedDoctor(2, {
      createdAt: new Date(now - 10 * DAY_MS),
      name: "Dr. Gamma",
      specialization: "Oncology",
    });
    await seedPatients([
      makePatient(0, docA.id, {
        condition: "Hypertension",
        createdAt: new Date(now),
      }),
      makePatient(1, docA.id, {
        condition: "Asthma",
        createdAt: new Date(now),
      }),
      makePatient(2, docB.id, {
        condition: "Hypertension",
        createdAt: new Date(now - 3 * DAY_MS),
      }),
    ]);

    const res = await request(authedApp()).get("/api/stats");
    expect(res.status).toBe(200);

    expect(res.body.totals).toEqual({ doctors: 3, patients: 3 });

    expect(res.body.patientsPerDoctor).toEqual([
      {
        count: 2,
        doctorId: docA.id,
        name: "Dr. Alpha",
        specialization: "Cardiology",
      },
      {
        count: 1,
        doctorId: docB.id,
        name: "Dr. Beta",
        specialization: "Neurology",
      },
      {
        count: 0,
        doctorId: docC.id,
        name: "Dr. Gamma",
        specialization: "Oncology",
      },
    ]);

    expect(res.body.patientsByCondition).toEqual([
      { condition: "Hypertension", count: 2 },
      { condition: "Asthma", count: 1 },
    ]);

    expect(res.body.patientsPerDay).toHaveLength(30);
    const patientDayMap = new Map(
      res.body.patientsPerDay.map((d: { count: number; date: string }) => [
        d.date,
        d.count,
      ])
    );
    expect(patientDayMap.get(dayString(new Date(now)))).toBe(2);
    expect(patientDayMap.get(dayString(new Date(now - 3 * DAY_MS)))).toBe(1);
    const patientDaySum = res.body.patientsPerDay.reduce(
      (sum: number, d: { count: number }) => sum + d.count,
      0
    );
    expect(patientDaySum).toBe(3);

    expect(res.body.doctorsPerDay).toHaveLength(30);
    const doctorDayMap = new Map(
      res.body.doctorsPerDay.map((d: { count: number; date: string }) => [
        d.date,
        d.count,
      ])
    );
    expect(doctorDayMap.get(dayString(new Date(now)))).toBe(1);
    expect(doctorDayMap.get(dayString(new Date(now - 5 * DAY_MS)))).toBe(1);
    expect(doctorDayMap.get(dayString(new Date(now - 10 * DAY_MS)))).toBe(1);

    expect(res.body.recentPatients).toHaveLength(3);
    const [first] = res.body.recentPatients;
    expect(first.doctor).toEqual({
      id: first.doctorId,
      name: expect.any(String),
      specialization: expect.any(String),
    });
    expect(first._id).toBeUndefined();
    expect(first.__v).toBeUndefined();
  });
});
