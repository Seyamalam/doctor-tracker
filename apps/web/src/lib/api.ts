import { ENV } from "@/env";

const BASE_URL = ENV.NEXT_PUBLIC_SERVER_URL.replace(/\/$/u, "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
};

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  me: () =>
    request<{
      message: string;
      user: { email: string; id: string; name: string };
    }>("/me"),
  todos: {
    create: (text: string) =>
      request<Todo>("/todos", {
        body: JSON.stringify({ text }),
        method: "POST",
      }),
    list: () => request<Todo[]>("/todos"),
    remove: (id: string) =>
      request<undefined>(`/todos/${id}`, { method: "DELETE" }),
    update: (id: string, data: { completed: boolean }) =>
      request<{ success: boolean }>(`/todos/${id}`, {
        body: JSON.stringify(data),
        method: "PATCH",
      }),
  },
};
