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
  paginate,
  parseSort,
  sendValidationError,
  sortParam,
} from "../lib/listing";
import { requireAdmin } from "../middleware/require-role";
import type { PatientWithDoctor } from "../lib/patient-projection";

const SORTABLE_FIELDS = [
  "createdAt",
  "email",
  "hospital",
  "name",
  "patientCount",
  "specialization",
  "updatedAt",
] as const;

const PATIENT_SORTABLE_FIELDS = ["condition", "createdAt", "name", "updatedAt"] as const;

const listQuerySchema = z.object({
  ...listQueryFields,
  sort: sortParam(SORTABLE_FIELDS),
  specialization: optionalFilter,
});

const doctorPatientsQuerySchema = z.object({
  condition: optionalFilter,
  from: listQueryFields.from,
  limit: listQueryFields.limit,
  page: listQueryFields.page,
  search: listQueryFields.search,
  sort: sortParam(PATIENT_SORTABLE_FIELDS),
  to: listQueryFields.to,
});

const idParamsSchema = z.object({
  id: z.string().min(1),
});

const createDoctorSchema = z.object({
  email: z.email().max(254),
  hospital: z.string().trim().min(2).max(200),
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{7,30}$/u),
  specialization: z.string().trim().min(2).max(120),
});

const updateDoctorSchema = createDoctorSchema.partial();

interface DoctorItem {
  createdAt: Date;
  email: string;
  hospital: string;
  id: string;
  name: string;
  patientCount: number;
  phone: string;
  specialization: string;
  updatedAt: Date;
}

const doctorProjectStage = {
  $project: { __v: 0, _id: 0, patients: 0 },
};

const toDoctorItem = async (doc: Record<string, unknown>): Promise<DoctorItem> => {
  const { _id, __v, ...rest } = doc;
  const item = rest as Omit<DoctorItem, "patientCount">;
  const patientCount = await Patient.countDocuments({ doctorId: item.id });
  return { ...item, patientCount };
};

export const doctorsRouter = Router();

doctorsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const { from, limit, page, search, sort, specialization, to } = parsed.data;

    const match: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), "iu");
      match.$or = [
        { email: regex },
        { hospital: regex },
        { name: regex },
        { specialization: regex },
      ];
    }
    if (specialization) {
      match.specialization = specialization;
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

    const result = await paginate<DoctorItem>({
      dataStages: [doctorProjectStage],
      limit,
      model: Doctor,
      page,
      stages: [
        { $match: match },
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
        { $addFields: { patientCount: { $ifNull: [{ $first: "$patients.count" }, 0] } } },
        { $sort: parseSort(sort) },
      ],
    });

    res.json(result);
  }),
);

// Registered before /:id so the literal segment wins over the param route.
doctorsRouter.get(
  "/specializations",
  asyncHandler(async (_req, res) => {
    const values = await Doctor.distinct("specialization");
    const data = values
      .filter((value) => typeof value === "string" && value.length > 0)
      .toSorted((a, b) => a.localeCompare(b));
    res.json({ data });
  }),
);

doctorsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = createDoctorSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const created = await Doctor.create(parsed.data);
    const { _id, __v, ...doc } = created.toObject();
    res.status(201).json({ ...doc, patientCount: 0 });
  }),
);

doctorsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const doc = await Doctor.findOne({ id: params.data.id }).select("-_id -__v").lean();
    if (!doc) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json(await toDoctorItem(doc));
  }),
);

doctorsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const parsed = updateDoctorSchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const doc = await Doctor.findOneAndUpdate(
      { id: params.data.id },
      { $set: parsed.data },
      { returnDocument: "after" },
    )
      .select("-_id -__v")
      .lean();
    if (!doc) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json(await toDoctorItem(doc));
  }),
);

doctorsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const result = await Doctor.deleteOne({ id: params.data.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    await Patient.deleteMany({ doctorId: params.data.id });
    res.status(204).end();
  }),
);

doctorsRouter.get(
  "/:id/patients",
  asyncHandler(async (req, res) => {
    const params = idParamsSchema.safeParse(req.params);
    if (!params.success) {
      sendValidationError(res, params.error);
      return;
    }
    const parsed = doctorPatientsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error);
      return;
    }
    const { condition, from, limit, page, search, sort, to } = parsed.data;

    const doctor = await Doctor.findOne({ id: params.data.id }).select("-_id -__v").lean();
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }

    const match: Record<string, unknown> = { doctorId: doctor.id };
    if (search) {
      const regex = new RegExp(escapeRegex(search), "iu");
      match.$or = [{ condition: regex }, { name: regex }];
    }
    if (condition) {
      match.condition = condition;
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

    const result = await paginate<Omit<PatientWithDoctor, "doctor">>({
      dataStages: [{ $project: { __v: 0, _id: 0 } }],
      limit,
      model: Patient,
      page,
      stages: [{ $match: match }, { $sort: parseSort(sort) }],
    });

    const embedded = {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
    };
    res.json({
      ...result,
      data: result.data.map((patient) => ({ ...patient, doctor: embedded })),
    });
  }),
);
