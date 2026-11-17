"use client";

import { useTable } from "@tanstack/react-table";
import { ArrowLeft, Building2, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs";
import { DoctorFormDialog } from "@/components/doctor-form";
import { features, patientColumns } from "@/components/patient-columns";
import { PatientFormDialog } from "@/components/patient-form";
import {
  DateRangeFilters,
  FilterSelect,
  SearchInput,
  TableFooter,
} from "@/components/table-toolbar";
import { btn, Card, cx, EmptyState, Skeleton } from "@/components/ui";
import type { DoctorPatientsParams, Patient } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useDeleteDoctor, useDoctor, useDoctorPatients } from "@/lib/hooks/use-doctors";
import { useConditions, useDeletePatient } from "@/lib/hooks/use-patients";
import { useTableParams } from "@/lib/search-params";

const EMPTY: Patient[] = [];

export const DoctorViewSkeleton = () => (
  <main aria-busy="true" className="anim-fade mx-auto w-full max-w-6xl px-4 py-6">
    <Skeleton className="mb-4 h-4 w-28" />
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="mt-6 h-72 w-full rounded-xl" />
  </main>
);

const BackLink = () => (
  <Link
    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
    href="/doctors"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    All doctors
  </Link>
);

export const DoctorView = ({ id }: { id: string }) => {
  const router = useRouter();
  const doctorQuery = useDoctor(id);
  const deleteDoctor = useDeleteDoctor();
  const deletePatient = useDeletePatient();
  const params = useTableParams();
  const conditions = useConditions();

  const condition = params.get("condition");
  const listParams: DoctorPatientsParams = {
    condition,
    from: params.from,
    limit: params.limit,
    page: params.page,
    search: params.search,
    to: params.to,
  };
  const patientsQuery = useDoctorPatients(id, listParams);

  const [editDoctor, setEditDoctor] = useState(false);
  const [deleteDoctorOpen, setDeleteDoctorOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<Patient | "new" | null>(null);
  const [deletePatientTarget, setDeletePatientTarget] = useState<Patient | null>(null);

  const columns = useMemo(
    () =>
      patientColumns({
        onDelete: setDeletePatientTarget,
        onEdit: setPatientForm,
        showDoctor: false,
      }),
    [],
  );
  const table = useTable({
    columns,
    data: patientsQuery.data?.data ?? EMPTY,
    features,
    getRowId: (row) => row.id,
  });

  const doctor = doctorQuery.data;

  if (doctorQuery.isPending) {
    return <DoctorViewSkeleton />;
  }

  if (doctorQuery.isError || !doctor) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <BackLink />
        <Card className="mt-4">
          <EmptyState
            action={
              <button className={btn.outline} onClick={() => doctorQuery.refetch()} type="button">
                Retry
              </button>
            }
            description="This doctor may have been deleted, or the server is unreachable."
            title="Doctor not found"
          />
        </Card>
      </main>
    );
  }

  const patients = patientsQuery.data;
  const hasFilters = Boolean(params.search || condition || params.from || params.to);

  return (
    <main className="anim-enter mx-auto w-full max-w-6xl px-4 py-6">
      <BackLink />

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{doctor.name}</h1>
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                {doctor.specialization}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {doctor.hospital}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                {doctor.phone}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {doctor.email}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                {doctor.patientCount} patient
                {doctor.patientCount === 1 ? "" : "s"} · joined {formatDate(doctor.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className={btn.outline} onClick={() => setEditDoctor(true)} type="button">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              className={btn.dangerGhost}
              onClick={() => setDeleteDoctorOpen(true)}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Patients</h2>
        <button className={btn.primary} onClick={() => setPatientForm("new")} type="button">
          <Plus className="h-4 w-4" />
          Add patient
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <SearchInput placeholder="Search patients…" />
        <FilterSelect
          items={(conditions.data ?? []).map((c) => ({ label: c, value: c }))}
          label="Condition"
          param="condition"
        />
        <DateRangeFilters />
      </div>

      <div
        className={cx(
          "mt-4 transition-opacity duration-150 motion-reduce:transition-none",
          patientsQuery.isFetching && !patientsQuery.isPending && "opacity-60",
        )}
      >
        <DataTable
          columnCount={columns.length}
          empty={{
            action: (
              <button className={btn.primary} onClick={() => setPatientForm("new")} type="button">
                <Plus className="h-4 w-4" />
                Add patient
              </button>
            ),
            description: hasFilters
              ? "Try different search terms or filters."
              : `${doctor.name} has no patients yet.`,
            title: hasFilters ? "No patients match your filters" : "No patients yet",
          }}
          isError={patientsQuery.isError}
          isLoading={patientsQuery.isPending}
          minWidthClass="min-w-[32rem]"
          onRetry={() => patientsQuery.refetch()}
          table={table}
        />
      </div>

      {patients ? (
        <div className="mt-4">
          <TableFooter
            limit={patients.limit}
            page={patients.page}
            total={patients.total}
            totalPages={patients.totalPages}
          />
        </div>
      ) : null}

      <DoctorFormDialog doctor={doctor} onOpenChange={setEditDoctor} open={editDoctor} />
      <ConfirmDialog
        confirmLabel="Delete doctor"
        description={`This permanently removes Dr. ${doctor.name} and unassigns their patients. This can't be undone.`}
        onConfirm={async () => {
          await deleteDoctor.mutateAsync(doctor.id);
          router.replace("/doctors");
        }}
        onOpenChange={setDeleteDoctorOpen}
        open={deleteDoctorOpen}
        title="Delete doctor?"
      />
      <PatientFormDialog
        fixedDoctorId={doctor.id}
        fixedDoctorName={doctor.name}
        onOpenChange={(open) => {
          if (!open) {
            setPatientForm(null);
          }
        }}
        open={patientForm !== null}
        patient={patientForm === "new" || !patientForm ? undefined : patientForm}
      />
      <ConfirmDialog
        confirmLabel="Delete patient"
        description={`This permanently removes ${deletePatientTarget?.name ?? ""}. This can't be undone.`}
        onConfirm={async () => {
          if (deletePatientTarget) {
            await deletePatient.mutateAsync(deletePatientTarget.id);
            setDeletePatientTarget(null);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeletePatientTarget(null);
          }
        }}
        open={deletePatientTarget !== null}
        title="Delete patient?"
      />
    </main>
  );
};
