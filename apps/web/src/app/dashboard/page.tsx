import type { Metadata } from "next";
import { Suspense } from "react";

import Dashboard, { DashboardSkeleton } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const DashboardPage = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <Dashboard />
  </Suspense>
);

export default DashboardPage;
