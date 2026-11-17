"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export const useTableParams = () => {
  const searchParams = useSearchParams();
  return {
    from: searchParams.get("from") ?? "",
    get: (key: string) => searchParams.get(key) ?? "",
    limit: Math.max(1, Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE),
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    search: searchParams.get("search") ?? "",
    sort: searchParams.get("sort") ?? "",
    to: searchParams.get("to") ?? "",
  };
};

export const useSetTableParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, number | string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const isDefault =
          (key === "page" && Number(value) === 1) ||
          (key === "limit" && Number(value) === DEFAULT_PAGE_SIZE);
        if (value === null || value === undefined || value === "" || isDefault) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}` as Route);
    },
    [pathname, router, searchParams],
  );
};
