import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";

const isProd = process.env.NODE_ENV === "production";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) AppError (أخطاء مشروعك المقصودة)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? undefined,
      },
    });
  }

  // 2) Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.flatten(),
      },
    });
  }

  // 3) Prisma known errors (مثال مهم: unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = Unique constraint failed
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Conflict",
          details: { prismaCode: err.code, meta: err.meta },
        },
      });
    }

    // أي أخطاء Prisma معروفة أخرى
    return res.status(400).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Database error",
        details: isProd ? undefined : { prismaCode: err.code, meta: err.meta },
      },
    });
  }

  // 4) أي error غير متوقع
  console.error(err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      details: isProd ? undefined : { name: err?.name, message: err?.message, stack: err?.stack },
    },
  });
};
