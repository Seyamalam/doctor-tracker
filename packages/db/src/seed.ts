import "varlock/auto-load";
import mongoose from "mongoose";

import { ENV } from "./env";
import { Doctor } from "./models/doctor.model";
import { Patient } from "./models/patient.model";

const DAY_MS = 86_400_000;
const SPREAD_DAYS = 45;

const DOCTORS = [
  ["Dr. Amelia Chen", "Cardiology", "St. Mary's Medical Center", "+1 (415) 555-0142"],
  ["Dr. Marcus Webb", "Cardiology", "Riverside General Hospital", "+1 (212) 555-0198"],
  ["Dr. Priya Raghavan", "Neurology", "University Medical Center", "+1 (312) 555-0167"],
  ["Dr. Tomas Eriksson", "Neurology", "Northgate Clinic", "+1 (206) 555-0134"],
  ["Dr. Sofia Alvarez", "Pediatrics", "Children's Care Hospital", "+1 (617) 555-0119"],
  ["Dr. James Okafor", "Pediatrics", "Riverside General Hospital", "+1 (310) 555-0176"],
  ["Dr. Hannah Lindqvist", "Orthopedics", "Summit Orthopedic Institute", "+1 (404) 555-0151"],
  ["Dr. Raj Mehta", "Dermatology", "Clearview Dermatology Center", "+1 (503) 555-0123"],
  ["Dr. Elena Petrova", "Oncology", "Hope Cancer Institute", "+1 (512) 555-0188"],
  ["Dr. David Kim", "Oncology", "University Medical Center", "+1 (303) 555-0145"],
  ["Dr. Sarah Mitchell", "General Medicine", "Lakeside Family Clinic", "+1 (215) 555-0172"],
  ["Dr. Omar Hassan", "General Medicine", "Northgate Clinic", "+1 (646) 555-0111"],
  ["Dr. Ingrid Bauer", "Psychiatry", "Willowbrook Behavioral Health", "+1 (773) 555-0194"],
  ["Dr. Nathan Cole", "Radiology", "Summit Imaging Center", "+1 (415) 555-0160"],
  ["Dr. Yuki Tanaka", "Ophthalmology", "Brightview Eye Institute", "+1 (206) 555-0138"],
] as const;

const CONDITIONS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Asthma",
  "Migraine",
  "Arthritis",
  "Pneumonia",
  "Anemia",
  "Back Pain",
  "Hyperlipidemia",
  "GERD",
  "Anxiety",
  "Eczema",
  "Bronchitis",
  "Hypothyroidism",
  "Atrial Fibrillation",
  "Depression",
  "Obesity",
  "Insomnia",
  "UTI",
  "Sinusitis",
] as const;

const PATIENT_NAMES = [
  "Oliver Grant",
  "Emma Richardson",
  "Liam Foster",
  "Ava Delgado",
  "Noah Whitfield",
  "Isabella Marsh",
  "Ethan Caldwell",
  "Mia Thornton",
  "Lucas Beaumont",
  "Charlotte Reyes",
  "Henry Castillo",
  "Amelia Vance",
  "Sebastian Lowe",
  "Harper Quinn",
  "Jack Donnelly",
  "Evelyn Sharp",
  "Owen Mercer",
  "Abigail Frost",
  "Leo Sandoval",
  "Ella Chambers",
  "Julian Pratt",
  "Grace Holloway",
  "Wyatt Sinclair",
  "Chloe Abbott",
  "Gabriel Roach",
  "Lily Davenport",
  "Isaac McConnell",
  "Zoe Pruitt",
  "Caleb Rowe",
  "Nora Gaines",
  "Dominic Waller",
  "Stella Rios",
  "Aaron McKee",
  "Hazel Bright",
  "Christian Hobbs",
  "Violet Lutz",
  "Jonathan Sykes",
  "Aurora Blevins",
  "Levi Contreras",
  "Savannah McCann",
  "Christopher York",
  "Brooklyn Steele",
  "Hunter Wiley",
  "Bella O'Donnell",
  "Andrew Pena",
  "Claire Munoz",
  "Joshua Barron",
  "Lucy Hale",
  "Ryan Decker",
  "Paisley Krause",
  "Nathaniel Sexton",
  "Everly Conrad",
  "Thomas Battle",
  "Scarlett Nolan",
  "Charles Pineda",
  "Madison Cote",
  "Samuel Vickers",
  "Avery Duke",
  "David Harrell",
  "Sofia Lanier",
] as const;

// Deterministic per-doctor patient counts summing to 60.
const PATIENTS_PER_DOCTOR = [4, 3, 5, 4, 6, 3, 4, 5, 3, 4, 4, 5, 4, 3, 3];

const slugify = (name: string): string =>
  name
    .replace(/^Dr\.\s*/u, "")
    .toLowerCase()
    .replaceAll(/[^a-z]+/gu, ".");

const buildDoctors = (now: number) =>
  DOCTORS.map(([name, specialization, hospital, phone], index) => {
    const createdAt = new Date(
      now - ((index * 13) % SPREAD_DAYS) * DAY_MS - (index % 9) * 3_600_000,
    );
    return {
      createdAt,
      email: `${slugify(name)}@clinic.example.com`,
      hospital,
      id: new mongoose.Types.ObjectId().toString(),
      name,
      phone,
      specialization,
      updatedAt: createdAt,
    };
  });

interface DoctorSeed {
  createdAt: Date;
  email: string;
  hospital: string;
  id: string;
  name: string;
  phone: string;
  specialization: string;
  updatedAt: Date;
}

const buildPatients = (doctors: DoctorSeed[], now: number) => {
  const patients = [];
  let cursor = 0;
  for (const [doctorIndex, count] of PATIENTS_PER_DOCTOR.entries()) {
    const doctor = doctors[doctorIndex];
    if (!doctor) {
      continue;
    }
    for (let j = 0; j < count; j += 1) {
      const index = cursor;
      cursor += 1;
      const createdAt = new Date(
        now - ((index * 7 + doctorIndex * 3) % SPREAD_DAYS) * DAY_MS - (index % 13) * 3_600_000,
      );
      patients.push({
        condition: CONDITIONS[index % CONDITIONS.length],
        createdAt,
        doctorId: doctor.id,
        id: new mongoose.Types.ObjectId().toString(),
        name: PATIENT_NAMES[index % PATIENT_NAMES.length],
        updatedAt: createdAt,
      });
    }
  }
  return patients;
};

const main = async (): Promise<void> => {
  await mongoose.connect(ENV.DATABASE_URL);
  await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);

  const now = Date.now();
  const doctors = buildDoctors(now);
  const patients = buildPatients(doctors, now);

  await Doctor.insertMany(doctors, { timestamps: false });
  await Patient.insertMany(patients, { timestamps: false });

  console.log(`Seed complete: ${doctors.length} doctors, ${patients.length} patients`);
};

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
