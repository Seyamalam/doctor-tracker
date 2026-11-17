import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.session?.user.role === "admin") {
    next();
    return;
  }
  res.status(403).json({ error: "Forbidden — admin role required" });
};
