import type { ErrorRequestHandler, RequestHandler } from "express";

interface HttpError {
  headers?: Record<string, string>;
  status?: number;
  statusCode?: number;
}

const errorStatus = (err: unknown): number => {
  const { status, statusCode } = (err ?? {}) as HttpError;
  const code = status ?? statusCode;
  return typeof code === "number" && code >= 400 && code < 600 ? code : 500;
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = errorStatus(err);
  const { headers } = (err ?? {}) as HttpError;
  if (headers) {
    res.set(headers);
  }
  if (status >= 500) {
    console.error(err);
  }
  const message =
    status < 500 && err instanceof Error
      ? err.message
      : "Internal Server Error";
  res.status(status).json({ error: message });
};
