"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutResponseSchema = exports.meResponseSchema = exports.refreshResponseSchema = exports.loginResponseSchema = exports.registerResponseSchema = exports.userPublicSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("../../docs/openapi/zod");
exports.registerSchema = zod_1.z
    .object({
    email: zod_1.z.email().openapi({ example: "test@example.com" }),
    password: zod_1.z.string().min(8).openapi({ example: "12345678" }),
    name: zod_1.z.string().min(1).openapi({ example: "Seoudy" }),
})
    .openapi("RegisterRequest");
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.email().openapi({ example: "test@example.com" }),
    password: zod_1.z.string().min(8).openapi({ example: "12345678" }),
})
    .openapi("LoginRequest");
exports.userPublicSchema = zod_1.z
    .object({
    id: zod_1.z.string().openapi({ example: "ckw..." }),
    email: zod_1.z.email().openapi({ example: "test@example.com" }),
    name: zod_1.z.string().openapi({ example: "Seoudy" }),
    createdAt: zod_1.z.string().openapi({ example: "2026-01-27T10:00:00.000Z" }),
})
    .openapi("UserPublic");
exports.registerResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "User registered" }),
    data: exports.userPublicSchema,
})
    .openapi("RegisterResponse");
exports.loginResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "User logged in" }),
    data: zod_1.z.object({
        accessToken: zod_1.z.string().openapi({ example: "eyJ..." }),
        user: exports.userPublicSchema,
    }),
})
    .openapi("LoginResponse");
exports.refreshResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "Token refreshed" }),
    data: zod_1.z.object({
        accessToken: zod_1.z.string().openapi({ example: "eyJ..." }),
    }),
})
    .openapi("RefreshResponse");
exports.meResponseSchema = zod_1.z
    .object({
    data: exports.userPublicSchema,
})
    .openapi("MeResponse");
exports.logoutResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "Logged out" }),
})
    .openapi("LogoutResponse");
