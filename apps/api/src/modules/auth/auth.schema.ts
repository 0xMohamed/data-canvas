import { z } from "../../docs/openapi/zod";

export const registerSchema = z
    .object({
        email: z.email().openapi({ example: "test@example.com" }),
        password: z.string().min(8).openapi({ example: "12345678" }),
        name: z.string().min(1).openapi({ example: "Seoudy" }),
    })
    .openapi("RegisterRequest");

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
    .object({
        email: z.email().openapi({ example: "test@example.com" }),
        password: z.string().min(8).openapi({ example: "12345678" }),
    })
    .openapi("LoginRequest");

export type LoginInput = z.infer<typeof loginSchema>;

export const userPublicSchema = z
    .object({
        id: z.string().openapi({ example: "ckw..." }),
        email: z.email().openapi({ example: "test@example.com" }),
        name: z.string().openapi({ example: "Seoudy" }),
        createdAt: z.string().openapi({ example: "2026-01-27T10:00:00.000Z" }),
    })
    .openapi("UserPublic");

export const registerResponseSchema = z
    .object({
        message: z.string().openapi({ example: "User registered" }),
        data: userPublicSchema,
    })
    .openapi("RegisterResponse");

export const loginResponseSchema = z
    .object({
        message: z.string().openapi({ example: "User logged in" }),
        data: z.object({
            accessToken: z.string().openapi({ example: "eyJ..." }),
            user: userPublicSchema,
        }),
    })
    .openapi("LoginResponse");

export const refreshResponseSchema = z
    .object({
        message: z.string().openapi({ example: "Token refreshed" }),
        data: z.object({
            accessToken: z.string().openapi({ example: "eyJ..." }),
        }),
    })
    .openapi("RefreshResponse");

export const meResponseSchema = z
    .object({
        data: userPublicSchema,
    })
    .openapi("MeResponse");

export const logoutResponseSchema = z
    .object({
        message: z.string().openapi({ example: "Logged out" }),
    })
    .openapi("LogoutResponse");
