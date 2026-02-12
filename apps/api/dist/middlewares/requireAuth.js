"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const env_1 = require("../config/env");
const requireAuth = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return next(new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Missing Authorization header",
        }));
    }
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return next(new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid Authorization header format",
        }));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        if (payload.type !== "access") {
            return next(new AppError_1.AppError({
                status: 401,
                code: "UNAUTHORIZED",
                message: "Invalid token type",
            }));
        }
        req.user = { id: payload.userId, email: payload.email };
        return next();
    }
    catch {
        return next(new AppError_1.AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
        }));
    }
};
exports.requireAuth = requireAuth;
