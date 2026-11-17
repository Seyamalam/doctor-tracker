import { ENV } from "@/env";

const boundServerUrl =
  typeof window === "undefined" ? process.env.SERVER_URL : undefined;
const BASE_URL = (boundServerUrl ?? ENV.NEXT_PUBLIC_SERVER_URL ?? "").replace(
  /\/$/u,
  ""
);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    void fetch(`${BASE_URL}/api/auth/sign-out`, {
      credentials: "include",
      method: "POST",
    });
    window.location.assign("/login");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
};

const toQuery = (
  params: Record<string, string | number | undefined>
): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  condition: string;
  doctorId: string;
  doctor: { id: string; name: string; specialization: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  totals: { doctors: number; patients: number };
  patientsPerDoctor: {
    doctorId: string;
    name: string;
    specialization: string;
    count: number;
  }[];
  patientsByCondition: { condition: string; count: number }[];
  patientsPerDay: { date: string; count: number }[];
  doctorsPerDay: { date: string; count: number }[];
  recentPatients: Patient[];
}

export interface DoctorInput {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientInput {
  name: string;
  condition: string;
  doctorId: string;
}

export interface DoctorsParams {
  search?: string;
  specialization?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PatientsParams {
  search?: string;
  condition?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface DoctorPatientsParams {
  search?: string;
  condition?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const api = {
  doctors: {
    create: (data: DoctorInput) =>
      request<Doctor>("/doctors", {
        body: JSON.stringify(data),
        method: "POST",
      }),
    get: (id: string, init?: RequestInit) =>
      request<Doctor>(`/doctors/${id}`, init),
    list: (params: DoctorsParams) =>
      request<Paginated<Doctor>>(`/doctors${toQuery({ ...params })}`),
    patients: (id: string, params: DoctorPatientsParams) =>
      request<Paginated<Patient>>(
        `/doctors/${id}/patients${toQuery({ ...params })}`
      ),
    remove: (id: string) =>
      request<undefined>(`/doctors/${id}`, { method: "DELETE" }),
    specializations: () =>
      request<{ data: string[] }>("/doctors/specializations"),
    update: (id: string, data: Partial<DoctorInput>) =>
      request<Doctor>(`/doctors/${id}`, {
        body: JSON.stringify(data),
        method: "PATCH",
      }),
  },
  health: () => request<{ status: string }>("/health"),
  patients: {
    conditions: () => request<{ data: string[] }>("/patients/conditions"),
    create: (data: PatientInput) =>
      request<Patient>("/patients", {
        body: JSON.stringify(data),
        method: "POST",
      }),
    get: (id: string) => request<Patient>(`/patients/${id}`),
    list: (params: PatientsParams) =>
      request<Paginated<Patient>>(`/patients${toQuery({ ...params })}`),
    remove: (id: string) =>
      request<undefined>(`/patients/${id}`, { method: "DELETE" }),
    update: (id: string, data: Partial<PatientInput>) =>
      request<Patient>(`/patients/${id}`, {
        body: JSON.stringify(data),
        method: "PATCH",
      }),
  },
  stats: () => request<Stats>("/stats"),
};
