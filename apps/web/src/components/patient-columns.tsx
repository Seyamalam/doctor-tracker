import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import type { TableFeatures } from "@tanstack/react-table";
import type { Route } from "next";
import Link from "next/link";

import { RowActionsMenu } from "@/components/data-table";
import type { Patient } from "@/lib/api";
import { formatDate } from "@/lib/format";

const features: TableFeatures = tableFeatures({});
const helper = createColumnHelper<typeof features, Patient>();

export { features };

interface PatientColumnsOptions {
  showDoctor?: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const patientColumns = ({ showDoctor = true, onEdit, onDelete }: PatientColumnsOptions) =>
  helper.columns([
    helper.accessor("name", {
      cell: (ctx) => <span className="font-medium">{ctx.getValue()}</span>,
      header: "Name",
    }),
    helper.accessor("condition", { header: "Condition" }),
    ...(showDoctor
      ? [
          helper.accessor((row) => row.doctor?.name ?? "", {
            cell: (ctx) => {
              const { doctor } = ctx.row.original;
              return doctor ? (
                <Link
                  className="text-primary hover:underline"
                  href={`/doctors/${doctor.id}` as Route}
                >
                  {doctor.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              );
            },
            header: "Doctor",
            id: "doctor",
          }),
        ]
      : []),
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
