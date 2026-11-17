"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, isUnauthorized } from "@/lib/api";
import type { ApiError, Paginated, Patient, PatientInput, PatientsParams } from "@/lib/api";

const toastError = (error: unknown, fallback: string) => {
  if (!isUnauthorized(error)) {
    toast.error(error instanceof Error ? error.message : fallback);
  }
};

export const usePatients = (params: PatientsParams) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => api.patients.list(params),
    queryKey: ["patients", params],
  });

export const useConditions = () =>
  useQuery({
    queryFn: () => api.patients.conditions(),
    queryKey: ["conditions"],
    select: (result) => result.data,
    staleTime: 60_000,
  });

const invalidatePatients = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ["patients"] });
  void queryClient.invalidateQueries({ queryKey: ["doctorPatients"] });
  void queryClient.invalidateQueries({ queryKey: ["doctors"] });
  void queryClient.invalidateQueries({ queryKey: ["doctor"] });
  void queryClient.invalidateQueries({ queryKey: ["stats"] });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientInput) => api.patients.create(data),
    onError: (error) => toastError(error, "Could not add patient"),
    onSuccess: () => {
      invalidatePatients(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["conditions"] });
      toast.success("Patient added");
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientInput> }) =>
      api.patients.update(id, data),
    onError: (error) => toastError(error, "Could not update patient"),
    onSuccess: () => {
      invalidatePatients(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["conditions"] });
      toast.success("Patient updated");
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation<
    undefined,
    ApiError,
    string,
    { previous: [QueryKey, Paginated<Patient> | undefined][] }
  >({
    mutationFn: (id: string) => api.patients.remove(id),
    onError: (error, _id, context) => {
      for (const [key, old] of context?.previous ?? []) {
        queryClient.setQueryData(key, old);
      }
      toastError(error, "Could not delete patient");
    },
    onMutate: async (
      id,
    ): Promise<{
      previous: [QueryKey, Paginated<Patient> | undefined][];
    }> => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });
      await queryClient.cancelQueries({ queryKey: ["doctorPatients"] });
      const previous = [
        ...queryClient.getQueriesData<Paginated<Patient>>({
          queryKey: ["patients"],
        }),
        ...queryClient.getQueriesData<Paginated<Patient>>({
          queryKey: ["doctorPatients"],
        }),
      ];
      for (const [key, old] of previous) {
        if (!old?.data.some((patient) => patient.id === id)) {
          continue;
        }
        queryClient.setQueryData<Paginated<Patient>>(key, {
          ...old,
          data: old.data.filter((patient) => patient.id !== id),
          total: Math.max(0, old.total - 1),
        });
      }
      return { previous };
    },
    onSettled: () => {
      invalidatePatients(queryClient);
    },
    onSuccess: () => {
      toast.success("Patient deleted");
    },
  });
};
