"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    status;
    code;
    details;
    constructor(params) {
        super(params.message);
        this.name = "AppError";
        this.status = params.status;
        this.code = params.code;
        this.details = params.details;
        Error.captureStackTrace?.(this, AppError);
    }
}
exports.AppError = AppError;
