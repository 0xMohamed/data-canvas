"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const env_1 = require("../../config/env");
const AppError_1 = require("../../utils/AppError");
const registerUser = async ({ email, password, name }) => {
    const userExists = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (userExists) {
        throw new AppError_1.AppError({
            status: 409,
            code: "CONFLICT",
            message: "Email already exists",
        });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, env_1.env.BCRYPT_SALT_ROUNDS);
    const createdUser = await prisma_1.prisma.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, createdAt: true },
    });
    return createdUser;
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password }) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
        });
    }
    const ok = await bcrypt_1.default.compare(password, user.password);
    if (!ok) {
        throw new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
        });
    }
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, type: "access" }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, type: "refresh" }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
    const publicUser = { id: user.id, email: user.email, name: user.name };
    return { accessToken, refreshToken, user: publicUser };
};
exports.loginUser = loginUser;
const refreshAccessToken = async (refreshToken) => {
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        if (payload.type !== "refresh") {
            throw new AppError_1.AppError({
                status: 401,
                code: "UNAUTHORIZED",
                message: "Invalid token type",
            });
        }
        // اختياري (لكن كويس): تأكد إن المستخدم لسه موجود
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            throw new AppError_1.AppError({
                status: 401,
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, type: "access" }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN });
        return { accessToken };
    }
    catch (e) {
        if (e instanceof AppError_1.AppError)
            throw e;
        throw new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
        });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const getCurrentUser = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "User not found",
        });
    }
    return user;
};
exports.getCurrentUser = getCurrentUser;
