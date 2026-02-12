"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const asyncHandler_1 = require("../../utils/asyncHandler");
const AppError_1 = require("../../utils/AppError");
const isProd = process.env.NODE_ENV === "production";
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const user = await (0, auth_service_1.registerUser)(body);
    return res.status(201).json({
        message: "User registered",
        data: user,
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const { accessToken, refreshToken, user } = await (0, auth_service_1.loginUser)(body);
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
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Missing refresh token",
        });
    }
    const data = await (0, auth_service_1.refreshAccessToken)(token);
    return res.status(200).json({
        message: "Token refreshed",
        data,
    });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
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
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const user = await (0, auth_service_1.getCurrentUser)(userId);
    return res.status(200).json({
        data: user,
    });
});
