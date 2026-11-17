import type { createAuth } from "@doctor-tracker/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { RequestHandler } from "express";

import { asyncHandler } from "../lib/async-handler";

type Auth = ReturnType<typeof createAuth>;

export type Session = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

declare module "express-serve-static-core" {
  interface Request {
    session?: Session;
  }
}

export const createRequireAuth = (auth: Auth): RequestHandler =>
  asyncHandler(async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.session = session;
    next();
  });
