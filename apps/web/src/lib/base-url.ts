import { ENV } from "@/env";

export const baseUrl =
  ENV.NEXT_PUBLIC_APP_URL ||
  (ENV.VERCEL_URL
    ? `https://${ENV.VERCEL_URL}`
    : "https://doctor-tracker-tau-sage.vercel.app");
