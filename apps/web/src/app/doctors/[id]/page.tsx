import type { Metadata } from "next";
import { Suspense } from "react";

import { DoctorView, DoctorViewSkeleton } from "./doctor-view";

export const generateMetadata = (): Metadata => ({ title: "Doctor" });

const DoctorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <Suspense fallback={<DoctorViewSkeleton />}>
      <DoctorView id={id} />
    </Suspense>
  );
};

export default DoctorPage;
