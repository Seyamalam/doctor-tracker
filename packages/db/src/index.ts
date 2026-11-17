import mongoose from "mongoose";

import type { DatabaseConfig } from "./config";

export const createDb = async (env: DatabaseConfig) => {
  await mongoose.connect(env.DATABASE_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose.connection.getClient().db();
};

export type Database = Awaited<ReturnType<typeof createDb>>;
