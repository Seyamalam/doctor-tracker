"use client";

import { useTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs";
import { doctorColumns, features } from "@/components/doctor-columns";
import { DoctorFormDialog } from "@/components/doctor-form";
import {
  ClearFiltersButton,
  DateRangeFilters,
  FilterSelect,
  SearchInput,
  SortSelect,
  TableFooter,
} from "@/components/table-toolbar";
import { btn, cx, PageHeader, Skeleton } from "@/components/ui";
import type { Doctor, DoctorsParams } from "@/lib/api";
import { useDeleteDoctor, useDoctors, useSpecializations } from "@/lib/hooks/use-doctors";
import { useSetTableParams, useTableParams } from "@/lib/search-params";

const EMPTY: Doctor[] = [];

const SORT_ITEMS = [
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
  { label: "Most patients", value: "patientCount:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
];

export const TableSkeleton = () => (
  <main aria-busy="true" className="anim-fade mx-auto w-full max-w-6xl px-4 py-6">
    <Skeleton className="mb-6 h-7 w-40" />
    <Skeleton className="h-14 w-full rounded-xl" />
    <Skeleton className="mt-4 h-72 w-full rounded-xl" />
  </main>
);

export const DoctorsView = () => {
  const params = useTableParams();
  const setParams = useSetTableParams();

  const specialization = params.get("specialization");
  const listParams: DoctorsParams = {
    from: params.from,
    limit: params.limit,
    page: params.page,
    search: params.search,
    sort: params.sort,
    specialization,
    to: params.to,
  };
  const query = useDoctors(listParams);
  const specializations = useSpecializations();
  const deleteDoctor = useDeleteDoctor();

  const [formTarget, setFormTarget] = useState<Doctor | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const columns = useMemo(
    () =>
      doctorColumns({
        onDelete: setDeleteTarget,
        onEdit: setFormTarget,
      }),
    [],
  );
  const table = useTable({
    columns,
    data: query.data?.data ?? EMPTY,
    features,
    getRowId: (row) => row.id,
  });

  const result = query.data;
  const hasFilters = Boolean(params.search || specialization || params.from || params.to);
  const clearFilters = () =>
    setParams({
      from: null,
      search: null,
      specialization: null,
      to: null,
    });

  return (
    <main className="anim-enter mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader description="Manage your doctor directory" title="Doctors">
        <button className={btn.primary} onClick={() => setFormTarget("new")} type="button">
          <Plus className="h-4 w-4" />
          New doctor
        </button>
      </PageHeader>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <SearchInput placeholder="Search doctors…" />
        <FilterSelect
          items={(specializations.data ?? []).map((s) => ({
            label: s,
            value: s,
          }))}
          label="Specialization"
          param="specialization"
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
              <button className={btn.outline} onClick={clearFilters} type="button">
                Clear filters
              </button>
            ) : (
              <button className={btn.primary} onClick={() => setFormTarget("new")} type="button">
                <Plus className="h-4 w-4" />
                Add doctor
              </button>
            ),
            description: hasFilters
              ? "Try different search terms or filters."
              : "Add your first doctor to start building the directory.",
            title: hasFilters ? "No doctors match your filters" : "No doctors yet",
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

      <DoctorFormDialog
        doctor={formTarget === "new" || !formTarget ? undefined : formTarget}
        onOpenChange={(open) => {
          if (!open) {
            setFormTarget(null);
          }
        }}
        open={formTarget !== null}
      />
      <ConfirmDialog
        confirmLabel="Delete doctor"
        description={`This permanently removes ${deleteTarget?.name ?? ""} and unassigns their patients. This can't be undone.`}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteDoctor.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        title="Delete doctor?"
      />
    </main>
  );
};
