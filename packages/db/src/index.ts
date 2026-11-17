import mongoose from "mongoose";

import type { DatabaseConfig } from "./config";

export const createDb = async (env: DatabaseConfig) => {
  await mongoose.connect(env.DATABASE_URL);
  return mongoose.connection.getClient().db();
};

export type Database = Awaited<ReturnType<typeof createDb>>;
