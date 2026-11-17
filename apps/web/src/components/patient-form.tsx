"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@ui-sdk/react/button";
import { DialogClose } from "@ui-sdk/react/dialog";
import { z } from "zod";

import { FormDialog } from "@/components/dialogs";
import { SelectField, TextField } from "@/components/form-fields";
import { btn } from "@/components/ui";
import type { Patient } from "@/lib/api";
import { useDoctorOptions } from "@/lib/hooks/use-doctors";
import { useCreatePatient, useUpdatePatient } from "@/lib/hooks/use-patients";

const patientSchema = z.object({
  condition: z.string().min(2, "Condition is required"),
  doctorId: z.string().min(1, "Choose a doctor"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const PatientForm = ({
  patient,
  fixedDoctorId,
  onDone,
}: {
  patient?: Patient;
  fixedDoctorId?: string;
  onDone: () => void;
}) => {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const doctorOptions = useDoctorOptions();

  const doctorItems = (doctorOptions.data ?? []).map((doctor) => ({
    label: `${doctor.name}, ${doctor.specialization}`,
    value: doctor.id,
  }));
  if (
    patient?.doctor &&
    !doctorItems.some((item) => item.value === patient.doctor?.id)
  ) {
    doctorItems.unshift({
      label: `${patient.doctor.name}, ${patient.doctor.specialization}`,
      value: patient.doctor.id,
    });
  }

  const form = useForm({
    defaultValues: {
      condition: patient?.condition ?? "",
      doctorId: fixedDoctorId ?? patient?.doctorId ?? "",
      name: patient?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        await (patient
          ? updatePatient.mutateAsync({ data: value, id: patient.id })
          : createPatient.mutateAsync(value));
        onDone();
      } catch {
        // Error toasted by the mutation hook; keep the dialog open.
      }
    },
    validators: {
      onSubmit: patientSchema,
    },
  });

  const submitLabel = patient ? "Save changes" : "Add patient";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{ onChange: patientSchema.shape.name }}
      >
        {(field) => <TextField field={field} label="Name" />}
      </form.Field>
      <form.Field
        name="condition"
        validators={{ onChange: patientSchema.shape.condition }}
      >
        {(field) => (
          <TextField
            field={field}
            label="Condition"
            placeholder="e.g. Hypertension"
          />
        )}
      </form.Field>
      {fixedDoctorId ? null : (
        <form.Field
          name="doctorId"
          validators={{ onChange: patientSchema.shape.doctorId }}
        >
          {(field) => (
            <SelectField
              field={field}
              items={doctorItems}
              label="Doctor"
              placeholder={
                doctorOptions.isPending ? "Loading doctors…" : "Select a doctor"
              }
            />
          )}
        </form.Field>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose className={btn.outline}>Cancel</DialogClose>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              className={btn.primary}
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export const PatientFormDialog = ({
  open,
  onOpenChange,
  patient,
  fixedDoctorId,
  fixedDoctorName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  fixedDoctorId?: string;
  fixedDoctorName?: string;
}) => {
  const baseDescription = patient
    ? "Update this patient's details."
    : "Add a patient and assign a doctor.";
  const description = fixedDoctorName
    ? `Assigned to ${fixedDoctorName}.`
    : baseDescription;

  return (
    <FormDialog
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={patient ? "Edit patient" : "New patient"}
    >
      <PatientForm
        fixedDoctorId={fixedDoctorId}
        onDone={() => onOpenChange(false)}
        patient={patient}
      />
    </FormDialog>
  );
};
