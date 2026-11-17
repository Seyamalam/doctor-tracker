import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

import { DoctorView, DoctorViewSkeleton } from "./doctor-view";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const cookie = (await headers()).get("cookie") ?? "";
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
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<DoctorViewSkeleton />}>
      <DoctorView id={id} />
    </Suspense>
  );
};

export default DoctorPage;
