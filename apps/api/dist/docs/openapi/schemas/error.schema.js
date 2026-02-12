"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorEnvelopeSchema = exports.errorCodeSchema = void 0;
const zod_1 = require("../zod");
exports.errorCodeSchema = zod_1.z.enum([
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "INTERNAL_ERROR",
]);
exports.errorEnvelopeSchema = zod_1.z
    .object({
    error: zod_1.z.object({
        code: exports.errorCodeSchema,
        message: zod_1.z.string(),
        details: zod_1.z.unknown().nullable().optional(),
    }),
})
    .openapi("ErrorEnvelope");
