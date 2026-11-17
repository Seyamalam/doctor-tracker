import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";

import { api } from "@/lib/api";

import { DoctorView, DoctorViewSkeleton } from "./doctor-view";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";
  try {
    const doctor = await api.doctors.get(id, { headers: { cookie } });
    return {
      description: `${doctor.specialization} at ${doctor.hospital}`,
      title: doctor.name,
    };
  } catch {
    return { title: "Doctor" };
  }
};

const DoctorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <Suspense fallback={<DoctorViewSkeleton />}>
      <DoctorView id={id} />
    </Suspense>
  );
};

export default DoctorPage;
