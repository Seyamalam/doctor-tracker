import { createAuth } from "@doctor-tracker/auth";
import { createDb } from "@doctor-tracker/db";

import { ENV } from "./env.server";

export const db = await createDb(ENV);
export const auth = createAuth(ENV, db);
