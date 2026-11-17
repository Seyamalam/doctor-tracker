"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, isUnauthorized } from "@/lib/api";
import type {
  ApiError,
  Doctor,
  DoctorInput,
  DoctorPatientsParams,
  DoctorsParams,
  Paginated,
} from "@/lib/api";

const toastError = (error: unknown, fallback: string) => {
  if (!isUnauthorized(error)) {
    toast.error(error instanceof Error ? error.message : fallback);
  }
};

export const useDoctors = (params: DoctorsParams) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => api.doctors.list(params),
    queryKey: ["doctors", params],
  });

export const useDoctor = (id: string) =>
  useQuery({
    queryFn: () => api.doctors.get(id),
    queryKey: ["doctor", id],
  });

export const useDoctorOptions = () =>
  useQuery({
    // The API clamps limit at 50; page through so no doctor is missing from selects.
    queryFn: async () => {
      const first = await api.doctors.list({ limit: 50, page: 1 });
      if (first.data.length >= first.total) {
        return first;
      }
      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, i) =>
          api.doctors.list({ limit: 50, page: i + 2 }),
        ),
      );
      return { ...first, data: [...first.data, ...rest.flatMap((page) => page.data)] };
    },
    queryKey: ["doctors", "options"],
    select: (result) => result.data,
    staleTime: 60_000,
  });

export const useSpecializations = () =>
  useQuery({
    queryFn: () => api.doctors.specializations(),
    queryKey: ["specializations"],
    select: (result) => result.data,
    staleTime: 60_000,
  });

export const useDoctorPatients = (doctorId: string, params: DoctorPatientsParams) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => api.doctors.patients(doctorId, params),
    queryKey: ["doctorPatients", doctorId, params],
  });

const invalidateDoctors = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ["doctors"] });
  void queryClient.invalidateQueries({ queryKey: ["stats"] });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DoctorInput) => api.doctors.create(data),
    onError: (error) => toastError(error, "Could not add doctor"),
    onSuccess: (doctor) => {
      invalidateDoctors(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success(`Dr. ${doctor.name} added`);
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DoctorInput> }) =>
      api.doctors.update(id, data),
    onError: (error) => toastError(error, "Could not update doctor"),
    onSuccess: (doctor) => {
      invalidateDoctors(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["doctor", doctor.id] });
      void queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Doctor updated");
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation<
    undefined,
    ApiError,
    string,
    { previous: [QueryKey, Paginated<Doctor> | undefined][] }
  >({
    mutationFn: (id: string) => api.doctors.remove(id),
    onError: (error, _id, context) => {
      for (const [key, old] of context?.previous ?? []) {
        queryClient.setQueryData(key, old);
      }
      toastError(error, "Could not delete doctor");
    },
    onMutate: async (
      id,
    ): Promise<{
      previous: [QueryKey, Paginated<Doctor> | undefined][];
    }> => {
      await queryClient.cancelQueries({ queryKey: ["doctors"] });
      const previous = queryClient.getQueriesData<Paginated<Doctor>>({
        queryKey: ["doctors"],
      });
      for (const [key, old] of previous) {
        if (!old?.data.some((doctor) => doctor.id === id)) {
          continue;
        }
        queryClient.setQueryData<Paginated<Doctor>>(key, {
          ...old,
          data: old.data.filter((doctor) => doctor.id !== id),
          total: Math.max(0, old.total - 1),
        });
      }
      return { previous };
    },
    onSettled: () => {
      invalidateDoctors(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["doctor"] });
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["doctorPatients"] });
    },
    onSuccess: () => {
      toast.success("Doctor deleted");
    },
  });
};
