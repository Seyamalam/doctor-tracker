import mongoose from "mongoose";

const { Schema, model } = mongoose;

const patientSchema = new Schema(
  {
    condition: {
      required: true,
      type: String,
    },
    doctorId: {
      ref: "Doctor",
      required: true,
      type: String,
    },
    id: {
      default: () => new mongoose.Types.ObjectId().toString(),
      required: true,
      type: String,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
  },
  {
    collection: "patient",
    id: false,
    timestamps: true,
  }
);

patientSchema.index({ createdAt: -1, doctorId: 1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ name: 1 });

const Patient = model("Patient", patientSchema);

export { Patient };
