import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { authClient } from "@/lib/auth-client";

import { DoctorView, DoctorViewSkeleton } from "./doctor-view";

export const metadata: Metadata = {
  title: "Doctor",
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
