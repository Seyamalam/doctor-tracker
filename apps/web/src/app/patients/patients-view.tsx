"use client";

import { useTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs";
import { features, patientColumns } from "@/components/patient-columns";
import { PatientFormDialog } from "@/components/patient-form";
import {
  ClearFiltersButton,
  DateRangeFilters,
  FilterSelect,
  SearchInput,
  SortSelect,
  TableFooter,
} from "@/components/table-toolbar";
import { btn, cx, PageHeader, Skeleton } from "@/components/ui";
import type { Patient, PatientsParams } from "@/lib/api";
import { useDoctorOptions } from "@/lib/hooks/use-doctors";
import { useConditions, useDeletePatient, usePatients } from "@/lib/hooks/use-patients";
import { useSetTableParams, useTableParams } from "@/lib/search-params";

const EMPTY: Patient[] = [];

const SORT_ITEMS = [
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
];

export const TableSkeleton = () => (
  <main aria-busy="true" className="anim-fade mx-auto w-full max-w-6xl px-4 py-6">
    <Skeleton className="mb-6 h-7 w-40" />
    <Skeleton className="h-14 w-full rounded-xl" />
    <Skeleton className="mt-4 h-72 w-full rounded-xl" />
  </main>
);

export const PatientsView = () => {
  const params = useTableParams();
  const setParams = useSetTableParams();

  const condition = params.get("condition");
  const doctorId = params.get("doctorId");
  const listParams: PatientsParams = {
    condition,
    doctorId,
    from: params.from,
    limit: params.limit,
    page: params.page,
    search: params.search,
    sort: params.sort,
    to: params.to,
  };
  const query = usePatients(listParams);
  const conditions = useConditions();
  const doctorOptions = useDoctorOptions();
  const deletePatient = useDeletePatient();

  const [formTarget, setFormTarget] = useState<Patient | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const columns = useMemo(
    () => patientColumns({ onDelete: setDeleteTarget, onEdit: setFormTarget }),
    [],
  );
  const table = useTable({
    columns,
    data: query.data?.data ?? EMPTY,
    features,
    getRowId: (row) => row.id,
  });

  const result = query.data;
  const hasFilters = Boolean(params.search || condition || doctorId || params.from || params.to);
  const clearFilters = () =>
    setParams({
      condition: null,
      doctorId: null,
      from: null,
      search: null,
      to: null,
    });

  return (
    <main className="anim-enter mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader description="Manage patients and their doctor assignments" title="Patients">
        <button className={btn.primary} onClick={() => setFormTarget("new")} type="button">
          <Plus className="h-4 w-4" />
          New patient
        </button>
      </PageHeader>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <SearchInput placeholder="Search patients…" />
        <FilterSelect
          items={(conditions.data ?? []).map((c) => ({ label: c, value: c }))}
          label="Condition"
          param="condition"
        />
        <FilterSelect
          items={(doctorOptions.data ?? []).map((d) => ({
            label: d.name,
            value: d.id,
          }))}
          label="Doctor"
          param="doctorId"
        />
        <SortSelect items={SORT_ITEMS} />
        <DateRangeFilters />
        {hasFilters ? <ClearFiltersButton onClear={clearFilters} /> : null}
      </div>

      <div
        className={cx(
          "mt-4 transition-opacity duration-150 motion-reduce:transition-none",
          query.isFetching && !query.isPending && "opacity-60",
        )}
      >
        <DataTable
          columnCount={columns.length}
          empty={{
            action: hasFilters ? (
              <ClearFiltersButton onClear={clearFilters} />
            ) : (
              <button className={btn.primary} onClick={() => setFormTarget("new")} type="button">
                <Plus className="h-4 w-4" />
                Add patient
              </button>
            ),
            description: hasFilters
              ? "Try different search terms or filters."
              : "Add your first patient to get started.",
            title: hasFilters ? "No patients match your filters" : "No patients yet",
          }}
          isError={query.isError}
          isLoading={query.isPending}
          onRetry={() => query.refetch()}
          table={table}
        />
      </div>

      {result ? (
        <div className="mt-4">
          <TableFooter
            limit={result.limit}
            page={result.page}
            total={result.total}
            totalPages={result.totalPages}
          />
        </div>
      ) : null}

      <PatientFormDialog
        onOpenChange={(open) => {
          if (!open) {
            setFormTarget(null);
          }
        }}
        open={formTarget !== null}
        patient={formTarget === "new" || !formTarget ? undefined : formTarget}
      />
      <ConfirmDialog
        confirmLabel="Delete patient"
        description={`This permanently removes ${deleteTarget?.name ?? ""}. This can't be undone.`}
        onConfirm={async () => {
          if (deleteTarget) {
            await deletePatient.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        title="Delete patient?"
      />
    </main>
  );
};
