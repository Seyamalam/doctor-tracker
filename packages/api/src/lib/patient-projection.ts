import type { PipelineStage } from "mongoose";

export const doctorEmbedStages: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      as: "doctor",
      foreignField: "id",
      from: "doctor",
      localField: "doctorId",
      pipeline: [{ $project: { _id: 0, id: 1, name: 1, specialization: 1 } }],
    },
  },
  { $addFields: { doctor: { $ifNull: [{ $first: "$doctor" }, null] } } },
  { $project: { __v: 0, _id: 0 } },
];

export interface EmbeddedDoctor {
  id: string;
  name: string;
  specialization: string;
}

export interface PatientWithDoctor {
  condition: string;
  createdAt: Date;
  doctor: EmbeddedDoctor | null;
  doctorId: string;
  id: string;
  name: string;
  updatedAt: Date;
}
