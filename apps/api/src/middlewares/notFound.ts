import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(
    new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    })
  );
};
