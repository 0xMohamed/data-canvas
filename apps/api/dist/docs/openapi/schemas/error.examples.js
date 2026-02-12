"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorExamples = void 0;
exports.errorExamples = {
    validation: {
        error: {
            code: "VALIDATION_ERROR",
            message: "Validation error",
            details: {
                fieldErrors: {
                    email: ["Invalid email"],
                },
            },
        },
    },
    unauthorized: {
        error: {
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
            details: null,
        },
    },
    forbidden: {
        error: {
            code: "FORBIDDEN",
            message: "You do not have access to this resource",
            details: null,
        },
    },
    notFound: {
        error: {
            code: "NOT_FOUND",
            message: "Resource not found",
            details: null,
        },
    },
    conflict: {
        error: {
            code: "CONFLICT",
            message: "Resource already exists",
            details: null,
        },
    },
    internal: {
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
            details: null,
        },
    },
};
