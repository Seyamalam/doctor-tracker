import "varlock/auto-load";
import mongoose from "mongoose";

import { ENV } from "./env";
import { Doctor } from "./models/doctor.model";
import { Patient } from "./models/patient.model";

const DAY_MS = 86_400_000;
const DOCTOR_COUNT = Number(process.env.SEED_DOCTORS ?? 50);
const PATIENT_COUNT = Number(process.env.SEED_PATIENTS ?? 500);
const DOCTOR_SPREAD_DAYS = 365;
const PATIENT_SPREAD_DAYS = 120;
const INSERT_CHUNK = 10_000;

// Deterministic PRNG so reseeds produce the same dataset.
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d_2b_79_f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};

const rand = mulberry32(0x5_13_37);

const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T;

const pickWeighted = (items: readonly string[], weights: readonly number[]): string => {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rand() * total;
  for (const [index, weight] of weights.entries()) {
    roll -= weight;
    if (roll <= 0) {
      return items[index] as string;
    }
  }
  return items[0] as string;
};

const FIRST_NAMES = [
  "Arif",
  "Tanvir",
  "Nusrat",
  "Ayesha",
  "Farhana",
  "Rahim",
  "Sharmin",
  "Taslima",
  "Imran",
  "Sabrina",
  "Mahmud",
  "Rumana",
  "Fahim",
  "Nadia",
  "Rashed",
  "Shirin",
  "Kamal",
  "Rehana",
  "Zahid",
  "Mousumi",
  "Ashraf",
  "Dilara",
  "Nur",
  "Salma",
  "Rafiq",
  "Jesmin",
  "Sohel",
  "Mahfuza",
  "Anwar",
  "Tahmina",
  "Rony",
  "Sharifa",
  "Selim",
  "Nasrin",
  "Farid",
  "Laila",
  "Bashar",
  "Roksana",
  "Jamal",
  "Parvin",
  "Shakil",
  "Munira",
  "Tareq",
  "Bithi",
  "Mizanur",
  "Hasina",
  "Liton",
  "Razia",
  "Nazmul",
  "Shamima",
  "Masud",
  "Kohinoor",
  "Jahid",
  "Fatema",
  "Rasel",
  "Morsheda",
  "Shahid",
  "Ferdousi",
  "Naim",
  "Rokeya",
  "Habib",
  "Mst. Anwara",
  "Moinul",
  "Suraiya",
  "Palash",
  "Jannatul",
  "Rezaul",
  "Shapla",
] as const;

const LAST_NAMES = [
  "Rahman",
  "Islam",
  "Hossain",
  "Haque",
  "Ahmed",
  "Chowdhury",
  "Khan",
  "Uddin",
  "Karim",
  "Alam",
  "Hasan",
  "Mia",
  "Sarker",
  "Bhuiyan",
  "Sheikh",
  "Talukder",
  "Molla",
  "Das",
  "Mondal",
  "Biswas",
  "Roy",
  "Saha",
  "Sen",
  "Ghosh",
  "Chakraborty",
  "Paul",
  "Barua",
  "Akhand",
  "Ferdous",
  "Hawlader",
  "Sikder",
  "Mazumder",
  "Kundu",
  "Barman",
  "Nath",
  "Khatun",
] as const;

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "General Medicine",
  "Psychiatry",
  "Radiology",
  "Ophthalmology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Rheumatology",
  "Anesthesiology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Obstetrics",
  "Urology",
  "Hematology",
  "Infectious Disease",
  "Geriatrics",
] as const;

const HOSPITALS = [
  "Dhaka Medical College Hospital",
  "Bangabandhu Sheikh Mujib Medical University",
  "Square Hospital",
  "Evercare Hospital Dhaka",
  "United Hospital",
  "Ibn Sina Hospital",
  "Labaid Specialized Hospital",
  "Popular Diagnostic Centre",
  "BRB Hospital",
  "BIRDEM General Hospital",
  "Shaheed Suhrawardy Medical College Hospital",
  "Sir Salimullah Medical College Hospital",
  "Kurmitola General Hospital",
  "Mugda Medical College Hospital",
  "Anwer Khan Modern Medical College Hospital",
  "Dhaka Community Hospital",
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

// Skew toward the first six conditions so the donut chart has a clear shape.
const CONDITION_WEIGHTS = [14, 12, 10, 8, 7, 6, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1] as const;

const slugify = (name: string): string =>
  name
    .replace(/^Dr\.\s*/u, "")
    .toLowerCase()
    .replaceAll(/[^a-z]+/gu, ".");

// Bangladeshi mobile format, e.g. +880 1712-345678.
const phone = (): string =>
  `+880 1${Math.floor(rand() * 9)}${Math.floor(rand() * 10)}-${String(
    Math.floor(rand() * 1_000_000),
  ).padStart(6, "0")}`;

const buildDoctors = (now: number) => {
  const doctors = [];
  for (let index = 0; index < DOCTOR_COUNT; index += 1) {
    const name = `Dr. ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const createdAt = new Date(now - rand() * DOCTOR_SPREAD_DAYS * DAY_MS);
    doctors.push({
      createdAt,
      email: `${slugify(name)}.${index}@clinic.example.com`,
      hospital: pick(HOSPITALS),
      id: new mongoose.Types.ObjectId().toString(),
      name,
      patientCount: 0,
      phone: phone(),
      specialization: pick(SPECIALIZATIONS),
      updatedAt: createdAt,
    });
  }
  return doctors;
};

interface DoctorSeed {
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

const buildPatients = (doctors: DoctorSeed[], now: number) => {
  const patients = [];
  for (let index = 0; index < PATIENT_COUNT; index += 1) {
    const doctor = doctors[Math.floor(rand() * doctors.length)] as DoctorSeed;
    doctor.patientCount += 1;
    const createdAt = new Date(now - rand() * PATIENT_SPREAD_DAYS * DAY_MS);
    patients.push({
      condition: pickWeighted(CONDITIONS, CONDITION_WEIGHTS),
      createdAt,
      doctorId: doctor.id,
      id: new mongoose.Types.ObjectId().toString(),
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      updatedAt: createdAt,
    });
  }
  return patients;
};

const insertChunked = async <T extends object>(
  model: {
    insertMany: (docs: T[], options: { timestamps: boolean }) => Promise<unknown>;
  },
  docs: T[],
): Promise<void> => {
  for (let start = 0; start < docs.length; start += INSERT_CHUNK) {
    await model.insertMany(docs.slice(start, start + INSERT_CHUNK), {
      timestamps: false,
    });
  }
};

const main = async (): Promise<void> => {
  const started = Date.now();
  await mongoose.connect(ENV.DATABASE_URL);
  await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);

  const now = Date.now();
  const doctors = buildDoctors(now);
  const patients = buildPatients(doctors, now);

  await insertChunked(Doctor, doctors);
  await insertChunked(Patient, patients);

  console.log(
    `Seed complete: ${doctors.length} doctors, ${patients.length} patients in ${Date.now() - started}ms`,
  );
};

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
