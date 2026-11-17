import "@doctor-tracker/db";
import { Doctor } from "@doctor-tracker/db/models/doctor.model";
import { Patient } from "@doctor-tracker/db/models/patient.model";
import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import type { PatientWithDoctor } from "../lib/patient-projection";
import { doctorEmbedStages } from "../lib/patient-projection";

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;
const RECENT_PATIENTS_LIMIT = 5;

const lastNDays = (days: number): { dates: string[]; start: Date } => {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - (days - 1) * DAY_MS);
  const dates: string[] = [];
  for (let i = 0; i < days; i += 1) {
    dates.push(new Date(start.getTime() + i * DAY_MS).toISOString().slice(0, 10));
  }
  return { dates, start };
};

const dayGroupStage = {
  $group: {
    _id: {
      $dateToString: {
        date: "$createdAt",
        format: "%Y-%m-%d",
        timezone: "UTC",
      },
    },
    count: { $sum: 1 },
  },
};

export const statsRouter = Router();

statsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { dates, start } = lastNDays(WINDOW_DAYS);

    const [doctors, patients, perDoctor, byCondition, patientDays, doctorDays, recentPatients] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Doctor.aggregate<{
          count: number;
          doctorId: string;
          name: string;
          specialization: string;
        }>([
          {
            $lookup: {
              as: "patients",
              from: "patient",
              let: { doctorId: "$id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$doctorId", "$$doctorId"] } } },
                { $count: "count" },
              ],
            },
          },
          {
            $project: {
              _id: 0,
              count: { $ifNull: [{ $first: "$patients.count" }, 0] },
              doctorId: "$id",
              name: 1,
              specialization: 1,
            },
          },
          { $sort: { count: -1, name: 1 } },
        ]),
        Patient.aggregate<{ condition: string; count: number }>([
          { $group: { _id: "$condition", count: { $sum: 1 } } },
          { $project: { _id: 0, condition: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ]),
        Patient.aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: start } } },
          dayGroupStage,
        ]),
        Doctor.aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: start } } },
          dayGroupStage,
        ]),
        Patient.aggregate<PatientWithDoctor>([
          { $sort: { createdAt: -1 } },
          { $limit: RECENT_PATIENTS_LIMIT },
          ...doctorEmbedStages,
        ]),
      ]);

    const patientCountByDay = new Map(patientDays.map((day) => [day._id, day.count]));
    const doctorCountByDay = new Map(doctorDays.map((day) => [day._id, day.count]));

    res.json({
      doctorsPerDay: dates.map((date) => ({
        count: doctorCountByDay.get(date) ?? 0,
        date,
      })),
      patientsByCondition: byCondition,
      patientsPerDay: dates.map((date) => ({
        count: patientCountByDay.get(date) ?? 0,
        date,
      })),
      patientsPerDoctor: perDoctor,
      recentPatients,
      totals: { doctors, patients },
    });
  }),
);
