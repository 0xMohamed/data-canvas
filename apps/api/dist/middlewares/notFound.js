"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const AppError_1 = require("../utils/AppError");
const notFound = (req, _res, next) => {
    next(new AppError_1.AppError({
        status: 404,
        code: "NOT_FOUND",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    }));
};
exports.notFound = notFound;
