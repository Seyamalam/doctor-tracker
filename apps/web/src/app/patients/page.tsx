import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { authClient } from "@/lib/auth-client";

import { PatientsView, TableSkeleton } from "./patients-view";

export const metadata: Metadata = {
  title: "Patients",
};

const PatientsPage = async () => {
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
    <Suspense fallback={<TableSkeleton />}>
      <PatientsView />
    </Suspense>
  );
};

export default PatientsPage;
