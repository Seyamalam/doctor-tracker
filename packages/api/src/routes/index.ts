import type { createAuth } from "@doctor-tracker/auth";
import { Router } from "express";

import { createRequireAuth } from "../middleware/require-auth";
import { todosRouter } from "./todos";

type Auth = ReturnType<typeof createAuth>;

export const createApiRouter = (auth: Auth): Router => {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.use(createRequireAuth(auth));

  router.get("/me", (req, res) => {
    res.json({ message: "This is private", user: req.session?.user });
  });

  router.use("/todos", todosRouter);

  return router;
};
