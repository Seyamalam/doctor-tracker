"use client";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@ui-sdk/react/alert-dialog";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import type { ReactNode } from "react";

import { btn, cx } from "@/components/ui";

export const backdropCls =
  "fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0";

export const dialogContentCls =
  "max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card text-foreground shadow-xl transition-[opacity,scale,translate] duration-200 ease-out data-ending-style:translate-y-2 data-ending-style:scale-[0.97] data-starting-style:translate-y-2 data-starting-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: FormDialogProps) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogBackdrop className={backdropCls} />
    <DialogContent className={dialogContentCls}>
      <div className="space-y-1">
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-muted-foreground text-[13px]">
            {description}
          </DialogDescription>
        ) : null}
      </div>
      {children}
    </DialogContent>
  </Dialog>
);

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) => (
  <AlertDialog onOpenChange={onOpenChange} open={open}>
    <AlertDialogBackdrop className={backdropCls} />
    <AlertDialogContent className={dialogContentCls}>
      <AlertDialogTitle className="text-base font-semibold">
        {title}
      </AlertDialogTitle>
      <AlertDialogDescription className="text-muted-foreground text-[13px]">
        {description}
      </AlertDialogDescription>
      <div className="flex justify-end gap-2">
        <AlertDialogClose className={btn.outline}>Cancel</AlertDialogClose>
        <AlertDialogClose
          action={onConfirm}
          className={cx(btn.danger, "data-pending:opacity-70")}
          value="confirm"
        >
          {confirmLabel}
        </AlertDialogClose>
      </div>
    </AlertDialogContent>
  </AlertDialog>
);
