"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export const useStats = () =>
  useQuery({
    queryFn: () => api.stats(),
    queryKey: ["stats"],
  });
