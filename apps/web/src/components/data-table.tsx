"use client";

import type { ReactTable, RowData, TableFeatures } from "@tanstack/react-table";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/react/menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  btn,
  cx,
  EmptyState,
  menuItemCls,
  popupAnimCls,
  popupCls,
  Skeleton,
} from "@/components/ui";

const SKELETON_ROWS = 6;

interface DataTableProps<TData extends RowData> {
  table: ReactTable<TableFeatures, TData>;
  columnCount: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  minWidthClass?: string;
  empty: {
    title: string;
    description?: string;
    action?: ReactNode;
  };
}

export const DataTable = <TData extends RowData>({
  table,
  columnCount,
  isLoading,
  isError,
  onRetry,
  minWidthClass = "min-w-[42rem]",
  empty,
}: DataTableProps<TData>) => {
  const { rows } = table.getRowModel();
  return (
    <div className="anim-fade border-border bg-card overflow-x-auto overscroll-contain rounded-xl border shadow-sm">
      <table className={cx("w-full border-collapse text-left text-sm", minWidthClass)}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="border-border bg-muted/50 border-b" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className="text-muted-foreground relative h-10 px-3 align-middle text-xs font-medium whitespace-nowrap"
                  key={header.id}
                  scope="col"
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr className="border-border border-b last:border-0" key={i}>
                  {Array.from({ length: columnCount }, (__, j) => (
                    <td className="px-3 py-2.5" key={j}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  className="border-border hover:bg-muted/50 border-b transition-colors last:border-0 motion-reduce:transition-none"
                  key={row.id}
                >
                  {row.getAllCells().map((cell) => (
                    /* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- FlexRender supplies the cell's content */
                    <td className="px-3 py-2.5 whitespace-nowrap" key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {isError ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-foreground text-sm font-medium">Could not load data</p>
          <p className="text-muted-foreground text-[13px]">Check your connection and try again.</p>
          <button className={btn.outline} onClick={onRetry} type="button">
            Retry
          </button>
        </div>
      ) : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState action={empty.action} description={empty.description} title={empty.title} />
      ) : null}
    </div>
  );
};

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const RowActionsMenu = ({ onEdit, onDelete }: RowActionsMenuProps) => (
  <Menu
    onAction={(value) => {
      if (value === "edit") {
        onEdit();
      } else if (value === "delete") {
        onDelete();
      }
    }}
  >
    <MenuTrigger
      aria-label="Row actions"
      className={cx(btn.icon, "data-popup-open:bg-muted data-popup-open:text-foreground")}
    >
      <MoreHorizontal className="h-4 w-4" />
    </MenuTrigger>
    <MenuContent
      align="end"
      className={cx(popupCls, popupAnimCls, "w-40 p-1")}
      side="bottom"
      sideOffset={4}
    >
      <MenuItem className={menuItemCls} value="edit">
        <Pencil className="text-muted-foreground h-3.5 w-3.5" />
        Edit
      </MenuItem>
      <MenuSeparator className="bg-border my-1 h-px" />
      <MenuItem className={cx(menuItemCls, "text-danger")} value="delete">
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </MenuItem>
    </MenuContent>
  </Menu>
);
