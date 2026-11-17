import type { Metadata } from "next";
import { Suspense } from "react";

import { DoctorsView, TableSkeleton } from "./doctors-view";

export const metadata: Metadata = {
  title: "Doctors",
};

const DoctorsPage = () => (
  <Suspense fallback={<TableSkeleton />}>
    <DoctorsView />
  </Suspense>
);

export default DoctorsPage;
