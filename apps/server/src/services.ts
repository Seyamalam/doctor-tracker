import { createAuth } from "@doctor-tracker/auth";
import { createDb } from "@doctor-tracker/db";

import { serverEnv } from "./env.server";

export const db = await createDb(serverEnv);
export const auth = createAuth(serverEnv, db);
