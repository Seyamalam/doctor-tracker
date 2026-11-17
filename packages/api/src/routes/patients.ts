import "@doctor-tracker/db";
import { Doctor } from "@doctor-tracker/db/models/doctor.model";
import { Patient } from "@doctor-tracker/db/models/patient.model";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import {
  escapeRegex,
  listQueryFields,
  optionalFilter,
  parseSort,
  sendValidationError,
  sortParam,
  toPaginated,
} from "../lib/listing";
import type { EmbeddedDoctor, PatientWithDoctor } from "../lib/patient-projection";
import { doctorEmbedStages } from "../lib/patient-projection";

const SORTABLE_FIELDS = ["condition", "createdAt", "doctorId", "name", "updatedAt"] as const;

const listQuerySchema = z.object({
  ...listQueryFields,
  condition: optionalFilter,
  doctorId: optionalFilter,
  sort: sortParam(SORTABLE_FIELDS),
});

const idParamsSchema = z.object({
  id: z.string().min(1),
});

const createPatientSchema = z.object({
  condition: z.string().trim().min(2).max(160),
  doctorId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(120),
});

const updatePatientSchema = createPatientSchema.partial();

interface PatientDoc {
  condition: string;
  createdAt: Date;
  doctorId: string;
  id: string;
  name: string;
  updatedAt: Date;
}

const findEmbeddedDoctor = async (doctorId: string): Promise<EmbeddedDoctor | null> => {
  const doctor = await Doctor.findOne({ id: doctorId })
    .select("-_id id name specialization")
    .lean();
  if (!doctor) {
    return null;
  }
  return {
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
  };
};

export const patientsRouter = Router();

patientsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const { condition, doctorId, from, limit, page, search, sort, to } = parsed.data;

    const match: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), "iu");
      match.$or = [{ condition: regex }, { name: regex }];
    }
    if (condition) {
      match.condition = condition;
    }
    if (doctorId) {
      match.doctorId = doctorId;
    }
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) {
        range.$gte = from;
      }
      if (to) {
        range.$lte = to;
      }
      match.createdAt = range;
    }

    const [result] = await Patient.aggregate<{
      data: PatientWithDoctor[];
      total: { count: number }[];
    }>([
      { $match: match },
      { $sort: parseSort(sort) },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }, ...doctorEmbedStages],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = result?.total[0]?.count ?? 0;
    res.json(toPaginated(result?.data ?? [], total, page, limit));
  }),
);

// Registered before /:id so the literal segment wins over the param route.
patientsRouter.get(
  "/conditions",
  asyncHandler(async (_req, res) => {
    const values = await Patient.distinct("condition");
    const data = values
      .filter((value) => typeof value === "string" && value.length > 0)
      .toSorted((a, b) => a.localeCompare(b));
    res.json({ data });
  }),
);

patientsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createPatientSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const doctor = await findEmbeddedDoctor(parsed.data.doctorId);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    const created = await Patient.create(parsed.data);
    const { _id, __v, ...doc } = created.toObject();
    res.status(201).json({ ...doc, doctor });
  }),
);

patientsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const doc = await Patient.findOne({ id: params.data.id })
      .select("-_id -__v")
      .lean<PatientDoc>();
    if (!doc) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    const doctor = await findEmbeddedDoctor(doc.doctorId);
    res.json({ ...doc, doctor });
  }),
);

patientsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const parsed = updatePatientSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const exists = await Patient.exists({ id: params.data.id });
    if (!exists) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (parsed.data.doctorId !== undefined) {
      const doctor = await findEmbeddedDoctor(parsed.data.doctorId);
      if (!doctor) {
        res.status(404).json({ error: "Doctor not found" });
        return;
      }
    }
    const doc = await Patient.findOneAndUpdate(
      { id: params.data.id },
      { $set: parsed.data },
      { returnDocument: "after" },
    )
      .select("-_id -__v")
      .lean<PatientDoc>();
    const doctor = await findEmbeddedDoctor(doc?.doctorId ?? "");
    res.json({ ...doc, doctor });
  }),
);

patientsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const result = await Patient.deleteOne({ id: params.data.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.status(204).end();
  }),
);
