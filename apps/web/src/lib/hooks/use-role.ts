"use client";

import { authClient } from "@/lib/auth-client";

export const useIsAdmin = () => {
  const { data: session, isPending } = authClient.useSession();
  return !isPending && session?.user.role === "admin";
};
