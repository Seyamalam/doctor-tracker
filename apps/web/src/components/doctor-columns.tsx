import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import type { TableFeatures } from "@tanstack/react-table";
import type { Route } from "next";
import Link from "next/link";

import { RowActionsMenu } from "@/components/data-table";
import type { Doctor } from "@/lib/api";
import { formatDate } from "@/lib/format";

const features: TableFeatures = tableFeatures({});
const helper = createColumnHelper<typeof features, Doctor>();

export { features };

interface DoctorColumnsOptions {
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export const doctorColumns = ({ onEdit, onDelete }: DoctorColumnsOptions) =>
  helper.columns([
    helper.accessor("name", {
      cell: (ctx) => (
        <Link
          className="text-primary block max-w-40 truncate font-medium hover:underline"
          href={`/doctors/${ctx.row.original.id}` as Route}
          title={ctx.getValue()}
        >
          {ctx.getValue()}
        </Link>
      ),
      header: "Name",
    }),
    helper.accessor("specialization", {
      cell: (ctx) => (
        <span className="block max-w-36 truncate" title={ctx.getValue()}>
          {ctx.getValue()}
        </span>
      ),
      header: "Specialization",
    }),
    helper.accessor("hospital", {
      cell: (ctx) => (
        <span className="block max-w-40 truncate" title={ctx.getValue()}>
          {ctx.getValue()}
        </span>
      ),
      header: "Hospital",
    }),
    helper.accessor("phone", {
      cell: (ctx) => <span className="text-muted-foreground">{ctx.getValue()}</span>,
      header: "Phone",
    }),
    helper.accessor("email", {
      cell: (ctx) => (
        <span className="text-muted-foreground block max-w-40 truncate" title={ctx.getValue()}>
          {ctx.getValue()}
        </span>
      ),
      header: "Email",
    }),
    helper.accessor("patientCount", {
      cell: (ctx) => <span className="font-medium tabular-nums">{ctx.getValue()}</span>,
      header: "Patients",
    }),
    helper.accessor("createdAt", {
      cell: (ctx) => <span className="text-muted-foreground">{formatDate(ctx.getValue())}</span>,
      header: "Added",
    }),
    helper.display({
      cell: (ctx) => (
        <RowActionsMenu
          onDelete={() => onDelete(ctx.row.original)}
          onEdit={() => onEdit(ctx.row.original)}
        />
      ),
      header: () => <span className="sr-only">Actions</span>,
      id: "actions",
    }),
  ]);
