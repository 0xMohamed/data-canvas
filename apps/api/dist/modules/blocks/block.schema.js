"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateBlocksResponseSchema = exports.blockResponseSchema = exports.bulkUpdateBlocksSchema = exports.updateBlockSchema = exports.createBlockSchema = exports.blockIdParamsSchema = exports.blockSchema = void 0;
const zod_1 = require("../../docs/openapi/zod");
exports.blockSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    canvasId: zod_1.z.string(),
    type: zod_1.z.string(),
    x: zod_1.z.number().int(),
    y: zod_1.z.number().int(),
    w: zod_1.z.number().int(),
    h: zod_1.z.number().int(),
    content: zod_1.z.unknown().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
})
    .openapi("Block");
// params
exports.blockIdParamsSchema = zod_1.z
    .object({
    blockId: zod_1.z.string().min(1),
})
    .openapi("BlockIdParams");
// requests
exports.createBlockSchema = zod_1.z
    .object({
    type: zod_1.z.string().min(1).max(50).openapi({ example: "text" }),
    x: zod_1.z.number().int().openapi({ example: 100 }),
    y: zod_1.z.number().int().openapi({ example: 200 }),
    w: zod_1.z.number().int().min(1).openapi({ example: 320 }),
    h: zod_1.z.number().int().min(1).openapi({ example: 120 }),
    content: zod_1.z.unknown().openapi({ example: { text: "Hello canvas" } }),
})
    .openapi("CreateBlockRequest");
exports.updateBlockSchema = zod_1.z
    .object({
    x: zod_1.z.number().int().optional(),
    y: zod_1.z.number().int().optional(),
    w: zod_1.z.number().int().min(1).optional(),
    h: zod_1.z.number().int().min(1).optional(),
    content: zod_1.z.unknown().optional(),
})
    .openapi("UpdateBlockRequest");
exports.bulkUpdateBlocksSchema = zod_1.z
    .object({
    updates: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        patch: exports.updateBlockSchema.refine((p) => Object.keys(p).length > 0, {
            message: "Patch cannot be empty",
        }),
    }))
        .min(1)
        .max(200),
})
    .openapi("BulkUpdateBlocksRequest");
// responses (reuse Block schema from canvas.schema لو أنت عاملها هناك)
exports.blockResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string(),
    data: exports.blockSchema,
})
    .openapi("BlockResponse");
exports.bulkUpdateBlocksResponseSchema = zod_1.z
    .object({
    message: zod_1.z.string(),
    data: zod_1.z.object({
        blocks: zod_1.z.array(exports.blockSchema),
    }),
})
    .openapi("BulkUpdateBlocksResponse");
