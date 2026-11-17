import { createApiRouter } from "@doctor-tracker/api";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

import { serverEnv } from "./env.server";
import { auth } from "./services";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    origin: serverEnv.CORS_ORIGIN,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json());

app.use("/api", createApiRouter(auth));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

export default app;

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
