import mongoose from "mongoose";

const { Schema, model } = mongoose;

const doctorSchema = new Schema(
  {
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
    },
    hospital: {
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
    phone: {
      required: true,
      type: String,
    },
    specialization: {
      required: true,
      type: String,
    },
  },
  {
    collection: "doctor",
    id: false,
    timestamps: true,
  },
);

doctorSchema.index({ name: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ hospital: "text", name: "text", specialization: "text" });

const Doctor = model("Doctor", doctorSchema);

export { Doctor };
