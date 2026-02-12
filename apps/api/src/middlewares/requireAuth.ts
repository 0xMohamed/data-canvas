import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

type AccessPayload = {
  userId: string;
  email: string;
  type: "access";
  iat: number;
  exp: number;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return next(
      new AppError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Missing Authorization header",
      }),
    );
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid Authorization header format",
      }),
    );
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;

    if (payload.type !== "access") {
      return next(
        new AppError({
          status: 401,
          code: "UNAUTHORIZED",
          message: "Invalid token type",
        }),
      );
    }

    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch {
    return next(
      new AppError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      }),
    );
  }
};
