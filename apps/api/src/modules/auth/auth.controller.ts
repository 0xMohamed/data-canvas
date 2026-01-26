import { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "./auth.schema";
import { getCurrentUser, loginUser, refreshAccessToken, registerUser } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

const isProd = process.env.NODE_ENV === "production";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterInput;
  const user = await registerUser(body);

  return res.status(201).json({
    message: "User registered",
    data: user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginInput;

  const { accessToken, refreshToken, user } = await loginUser(body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/auth/refresh",
  });

  return res.status(200).json({
    message: "User logged in",
    data: { accessToken, user },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Missing refresh token",
    });
  }

  const data = await refreshAccessToken(token);

  return res.status(200).json({
    message: "Token refreshed",
    data,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/auth/refresh",
  });

  return res.status(200).json({
    message: "Logged out",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await getCurrentUser(userId);

  return res.status(200).json({
    data: user,
  });
});