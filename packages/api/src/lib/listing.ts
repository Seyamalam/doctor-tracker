import type { Response } from "express";
import { z } from "zod";

const DEFAULT_LIMIT = 10;
const DEFAULT_SORT = "createdAt:desc";
const MAX_LIMIT = 50;
const SORT_PATTERN = /^[a-zA-Z]+:(?<direction>asc|desc)$/u;

export const escapeRegex = (value: string): string =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");

export const optionalFilter = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

export const listQueryFields = {
  from: z.coerce.date().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(DEFAULT_LIMIT)
    .transform((value) => Math.min(value, MAX_LIMIT)),
  page: z.coerce.number().int().min(1).default(1),
  search: optionalFilter,
  to: z.coerce.date().optional(),
};

export const sortParam = (allowed: readonly string[]) =>
  z
    .string()
    .regex(SORT_PATTERN)
    .refine((value) => allowed.includes(value.slice(0, value.indexOf(":"))))
    .default(DEFAULT_SORT);

export const parseSort = (sort: string): Record<string, 1 | -1> => {
  const separator = sort.indexOf(":");
  const field = sort.slice(0, separator);
  return { [field]: sort.slice(separator + 1) === "desc" ? -1 : 1 };
};

export interface Paginated<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export const toPaginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> => ({
  data,
  limit,
  page,
  total,
  totalPages: Math.ceil(total / limit),
});

export const sendValidationError = (res: Response, error: z.ZodError): void => {
  res.status(400).json({ error: "Validation failed", issues: error.issues });
};
