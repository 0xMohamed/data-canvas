"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflictErrorSchema = exports.updateSnapshotResponseSchema = exports.documentResponseSchema = exports.updateDocumentSnapshotSchema = exports.documentIdParamsSchema = void 0;
const zod_1 = require("../../docs/openapi/zod");
exports.documentIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
})
    .openapi("DocumentIdParams");
exports.updateDocumentSnapshotSchema = zod_1.z
    .object({
    baseRevision: zod_1.z.number().int().min(0),
    data: zod_1.z.unknown(),
})
    .openapi("UpdateDocumentSnapshotRequest");
exports.documentResponseSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    isPublic: zod_1.z.boolean(),
    revision: zod_1.z.number().int(),
    data: zod_1.z.unknown().nullable(),
})
    .openapi("DocumentResponse");
exports.updateSnapshotResponseSchema = zod_1.z
    .object({
    revision: zod_1.z.number().int(),
    savedAt: zod_1.z.string(),
})
    .openapi("UpdateSnapshotResponse");
exports.conflictErrorSchema = zod_1.z
    .object({
    code: zod_1.z.literal("CONFLICT"),
    message: zod_1.z.string(),
    currentRevision: zod_1.z.number().int().optional(),
    data: zod_1.z.unknown().nullable().optional(),
})
    .openapi("ConflictError");
