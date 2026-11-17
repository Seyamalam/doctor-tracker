import type { Metadata } from "next";
import { Suspense } from "react";

import { PatientsView, TableSkeleton } from "./patients-view";

export const metadata: Metadata = {
  title: "Patients",
};

const PatientsPage = () => (
  <Suspense fallback={<TableSkeleton />}>
    <PatientsView />
  </Suspense>
);

export default PatientsPage;
