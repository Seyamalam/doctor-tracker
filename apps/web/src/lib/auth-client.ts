import { createAuthClient } from "better-auth/react";

import { ENV } from "@/env";

const boundServerUrl = typeof window === "undefined" ? process.env.SERVER_URL : undefined;

export const authClient = createAuthClient({
  baseURL: (boundServerUrl ?? ENV.NEXT_PUBLIC_SERVER_URL) || undefined,
});
