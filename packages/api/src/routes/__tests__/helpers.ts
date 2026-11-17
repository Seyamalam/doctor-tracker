import { Doctor } from "@doctor-tracker/db/models/doctor.model";
import { Patient } from "@doctor-tracker/db/models/patient.model";
import type { Express } from "express";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createApiRouter } from "../../index";

export const DAY_MS = 86_400_000;

const TEST_SESSION = {
  session: {
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + DAY_MS),
    id: "session_test",
    token: "token_test",
    updatedAt: new Date(),
    userId: "user_test",
  },
  user: {
    createdAt: new Date(),
    email: "admin@example.com",
    emailVerified: true,
    id: "user_test",
    name: "Test Admin",
    role: "admin",
    updatedAt: new Date(),
  },
};

const buildApp = (session: unknown): Express => {
  const app = express();
  app.use(express.json());
  const auth = { api: { getSession: () => Promise.resolve(session) } };
  app.use("/api", createApiRouter(auth as never));
  return app;
};

export const authedApp = (): Express => buildApp(TEST_SESSION);
export const viewerApp = (): Express =>
  buildApp({
    ...TEST_SESSION,
    user: { ...TEST_SESSION.user, role: "viewer" },
  });
export const anonApp = (): Express => buildApp(null);

export const connectTestDb = async (): Promise<MongoMemoryServer> => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  return mongod;
};

export const disconnectTestDb = async (mongod: MongoMemoryServer): Promise<void> => {
  await mongoose.disconnect();
  await mongod.stop();
};

export const clearCollections = () => Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);

export const makeDoctor = (index: number, overrides: Record<string, unknown> = {}) => {
  const createdAt = new Date(Date.now() - index * DAY_MS);
  return {
    createdAt,
    email: `doctor${index}@example.com`,
    hospital: `Test Hospital ${index}`,
    id: new mongoose.Types.ObjectId().toString(),
    name: `Dr. Test ${index}`,
    phone: `+1 555-010${index}`,
    specialization: `Specialty ${index}`,
    updatedAt: createdAt,
    ...overrides,
  };
};

export const makePatient = (
  index: number,
  doctorId: string,
  overrides: Record<string, unknown> = {},
) => {
  const createdAt = new Date(Date.now() - index * DAY_MS);
  return {
    condition: `Condition ${index}`,
    createdAt,
    doctorId,
    id: new mongoose.Types.ObjectId().toString(),
    name: `Patient ${index}`,
    updatedAt: createdAt,
    ...overrides,
  };
};

export const seedDoctor = async (index = 0, overrides: Record<string, unknown> = {}) => {
  const doc = makeDoctor(index, overrides);
  await Doctor.insertMany([doc], { timestamps: false });
  return doc;
};

export const seedDoctors = (docs: ReturnType<typeof makeDoctor>[]) =>
  Doctor.insertMany(docs, { timestamps: false });

export const seedPatient = async (
  index: number,
  doctorId: string,
  overrides: Record<string, unknown> = {},
) => {
  const doc = makePatient(index, doctorId, overrides);
  await Patient.insertMany([doc], { timestamps: false });
  return doc;
};

export const seedPatients = (docs: ReturnType<typeof makePatient>[]) =>
  Patient.insertMany(docs, { timestamps: false });
