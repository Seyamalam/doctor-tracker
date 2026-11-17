import type { Session } from "@doctor-tracker/auth";
import type { Database } from "@doctor-tracker/db";

export type Context = {
  session: Session | null;
  db: Database;
};
