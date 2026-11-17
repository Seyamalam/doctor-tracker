import { ENV } from "./env";

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value;
};

if (!process.env.VERCEL) {
  await import("varlock/auto-load");
}

// The varlock CLI isn't bundled into Vercel functions and no .env files
// exist there, so resolve from process.env directly when deployed.
export const serverEnv: typeof ENV = process.env.VERCEL
  ? {
      BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
      BETTER_AUTH_URL: requiredEnv("BETTER_AUTH_URL"),
      CORS_ORIGIN: requiredEnv("CORS_ORIGIN"),
      DATABASE_URL: requiredEnv("DATABASE_URL"),
      NODE_ENV: (process.env.NODE_ENV ?? "production") as "production",
    }
  : ENV;
