import { User } from "@doctor-tracker/db/models/auth.model";

import { serverEnv } from "./env.server";
import { auth } from "./services";

const DEMO_ACCOUNTS = [
  { email: "admin@doctor-tracker.dev", name: "Demo Admin", password: "Admin1234!", role: "admin" },
  {
    email: "viewer@doctor-tracker.dev",
    name: "Demo Viewer",
    password: "Viewer1234!",
    role: "viewer",
  },
] as const;

const upsertAccount = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
  const existing = await User.findOne({ email: account.email }).lean();
  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email: account.email,
        name: account.name,
        password: account.password,
      },
      headers: new Headers({ origin: serverEnv.CORS_ORIGIN }),
    });
  }
  await User.updateOne({ email: account.email }, { $set: { role: account.role } });
};

for (const account of DEMO_ACCOUNTS) {
  await upsertAccount(account);
  console.log(`seeded ${account.email} (${account.role})`);
}

process.exit(0);
