"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCanvasesResponseSchema = exports.updateCanvasResponseSchema = exports.createCanvasResponseSchema = exports.canvasSchema = exports.listCanvasesQuerySchema = exports.updateCanvasSchema = exports.createCanvasSchema = exports.canvasIdParamsSchema = void 0;
const zod_1 = require("../../docs/openapi/zod");
// params
exports.canvasIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
})
    .openapi("CanvasIdParams");
// requests
exports.createCanvasSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(120).openapi({ example: "My first canvas" }),
    description: zod_1.z.string().max(500).nullable().optional().openapi({ example: "test" }),
    isPublic: zod_1.z.boolean().optional().openapi({ example: false }),
})
    .openapi("CreateCanvasRequest");
exports.updateCanvasSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(120).optional().openapi({ example: "New title" }),
    description: zod_1.z.string().max(500).nullable().optional().openapi({ example: null }),
    isPublic: zod_1.z.boolean().optional().openapi({ example: true }),
})
    .openapi("UpdateCanvasRequest");
// query (list)
exports.listCanvasesQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    q: zod_1.z.string().trim().min(1).optional().openapi({ example: "demo" }),
})
    .openapi("ListCanvasesQuery");
// shared schemas
exports.canvasSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    isPublic: zod_1.z.boolean(),
    publicToken: zod_1.z.string().nullable(),
    ownerId: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
})
    .openapi("Canvas");
// responses
exports.createCanvasResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "Canvas created" }),
    data: exports.canvasSchema,
})
    .openapi("CreateCanvasResponse");
exports.updateCanvasResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string().openapi({ example: "Canvas updated" }),
    data: exports.canvasSchema,
})
    .openapi("UpdateCanvasResponse");
exports.listCanvasesResponseSchema = zod_1.z
    .object({
    data: zod_1.z.object({
        items: zod_1.z.array(exports.canvasSchema),
        page: zod_1.z.number().int(),
        limit: zod_1.z.number().int(),
        total: zod_1.z.number().int(),
        totalPages: zod_1.z.number().int(),
    }),
})
    .openapi("ListCanvasesResponse");
