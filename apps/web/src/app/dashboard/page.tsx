import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { authClient } from "@/lib/auth-client";

import Dashboard, { DashboardSkeleton } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const DashboardPage = async () => {
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
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard name={session.user.name} />
    </Suspense>
  );
};

export default DashboardPage;
