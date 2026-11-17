import { createApiRouter, errorHandler, notFoundHandler } from "@doctor-tracker/api";
import { toNodeHandler } from "better-auth/node";
import compression from "compression";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";

import { serverEnv } from "./env.server";
import { auth } from "./services";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const RATE_LIMIT_MESSAGE = { error: "Too many requests, please try again later." };

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// CORP is relaxed because the API is consumed cross-origin by the web app.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    origin: serverEnv.CORS_ORIGIN,
  }),
);

app.use(
  "/api/auth",
  rateLimit({
    legacyHeaders: false,
    limit: 200,
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    windowMs: FIFTEEN_MINUTES_MS,
  }),
);
app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json({ limit: "100kb" }));

app.use(
  "/api",
  rateLimit({
    legacyHeaders: false,
    limit: 1000,
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    windowMs: FIFTEEN_MINUTES_MS,
  }),
);
app.use("/api", createApiRouter(auth));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  const server = app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received: closing HTTP server`);
    server.close(async () => {
      await mongoose.disconnect();
      console.log("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
