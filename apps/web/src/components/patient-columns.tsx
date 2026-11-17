import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import type { TableFeatures } from "@tanstack/react-table";
import type { Route } from "next";
import Link from "next/link";

import { RowActionsMenu } from "@/components/data-table";
import { Badge, CellAvatar } from "@/components/ui";
import type { Patient } from "@/lib/api";
import { formatDate } from "@/lib/format";

const features: TableFeatures = tableFeatures({});
const helper = createColumnHelper<typeof features, Patient>();

export { features };

interface PatientColumnsOptions {
  canMutate?: boolean;
  showDoctor?: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const patientColumns = ({
  canMutate = true,
  showDoctor = true,
  onEdit,
  onDelete,
}: PatientColumnsOptions) =>
  helper.columns([
    helper.accessor("name", {
      cell: (ctx) => (
        <span className="flex items-center gap-2.5">
          <CellAvatar name={ctx.getValue()} tone="muted" />
          <span className="block max-w-44 truncate font-medium" title={ctx.getValue()}>
            {ctx.getValue()}
          </span>
        </span>
      ),
      header: "Name",
    }),
    helper.accessor("condition", {
      cell: (ctx) => (
        <span className="block max-w-52 truncate" title={ctx.getValue()}>
          <Badge tone="primary">{ctx.getValue()}</Badge>
        </span>
      ),
      header: "Condition",
    }),
    ...(showDoctor
      ? [
          helper.accessor((row) => row.doctor?.name ?? "", {
            cell: (ctx) => {
              const { doctor } = ctx.row.original;
              return doctor ? (
                <Link
                  className="text-primary block max-w-44 truncate hover:underline"
                  href={`/doctors/${doctor.id}` as Route}
                  title={doctor.name}
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
    ...(canMutate
      ? [
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
        ]
      : []),
  ]);
