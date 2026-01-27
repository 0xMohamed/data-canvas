import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";

const isProd = process.env.NODE_ENV === "production";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? undefined,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Conflict",
          details: { prismaCode: err.code, meta: err.meta },
        },
      });
    }

    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Database error",
        details: isProd ? null : { prismaCode: err.code, meta: err.meta },
      },
    });
  }

  if (!isProd && err instanceof Error) {
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        details: { name: err.name, message: err.message, stack: err.stack },
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      details: isProd ? undefined : { name: err?.name, message: err?.message, stack: err?.stack },
    },
  });
};
