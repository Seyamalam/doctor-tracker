"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@ui-sdk/react/button";
import { DialogClose } from "@ui-sdk/react/dialog";
import { z } from "zod";

import { FormDialog } from "@/components/dialogs";
import { TextField } from "@/components/form-fields";
import { btn } from "@/components/ui";
import type { Doctor } from "@/lib/api";
import { useCreateDoctor, useUpdateDoctor } from "@/lib/hooks/use-doctors";

const doctorSchema = z.object({
  email: z.email("Enter a valid email"),
  hospital: z.string().min(2, "Hospital is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[\d\s()+.-]{7,}$/u, "Enter a valid phone number"),
  specialization: z.string().min(2, "Specialization is required"),
});

const DoctorForm = ({ doctor, onDone }: { doctor?: Doctor; onDone: () => void }) => {
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const form = useForm({
    defaultValues: {
      email: doctor?.email ?? "",
      hospital: doctor?.hospital ?? "",
      name: doctor?.name ?? "",
      phone: doctor?.phone ?? "",
      specialization: doctor?.specialization ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        await (doctor
          ? updateDoctor.mutateAsync({ data: value, id: doctor.id })
          : createDoctor.mutateAsync(value));
        onDone();
      } catch {
        // Error toasted by the mutation hook; keep the dialog open.
      }
    },
    validators: {
      onSubmit: doctorSchema,
    },
  });

  const submitLabel = doctor ? "Save changes" : "Add doctor";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name" validators={{ onChange: doctorSchema.shape.name }}>
        {(field) => <TextField field={field} label="Name" />}
      </form.Field>
      <form.Field
        name="specialization"
        validators={{ onChange: doctorSchema.shape.specialization }}
      >
        {(field) => (
          <TextField field={field} label="Specialization" placeholder="e.g. Cardiology" />
        )}
      </form.Field>
      <form.Field name="hospital" validators={{ onChange: doctorSchema.shape.hospital }}>
        {(field) => <TextField field={field} label="Hospital" />}
      </form.Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="phone" validators={{ onChange: doctorSchema.shape.phone }}>
          {(field) => <TextField field={field} label="Phone" type="tel" />}
        </form.Field>
        <form.Field name="email" validators={{ onChange: doctorSchema.shape.email }}>
          {(field) => <TextField autoComplete="email" field={field} label="Email" type="email" />}
        </form.Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose className={btn.outline}>Cancel</DialogClose>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button className={btn.primary} disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export const DoctorFormDialog = ({
  open,
  onOpenChange,
  doctor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor;
}) => (
  <FormDialog
    description={doctor ? "Update this doctor's details." : "Add a doctor to the directory."}
    onOpenChange={onOpenChange}
    open={open}
    title={doctor ? "Edit doctor" : "New doctor"}
  >
    <DoctorForm doctor={doctor} onDone={() => onOpenChange(false)} />
  </FormDialog>
);
