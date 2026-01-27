import { z } from "../../docs/openapi/zod";

export const blockSchema = z
  .object({
    id: z.string(),
    canvasId: z.string(),
    type: z.string(),
    x: z.number().int(),
    y: z.number().int(),
    w: z.number().int(),
    h: z.number().int(),
    content: z.unknown().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Block");


// params
export const blockIdParamsSchema = z
  .object({
    blockId: z.string().min(1),
  })
  .openapi("BlockIdParams");

export type BlockIdParams = z.infer<typeof blockIdParamsSchema>;

// requests
export const createBlockSchema = z
  .object({
    type: z.string().min(1).max(50).openapi({ example: "text" }),
    x: z.number().int().openapi({ example: 100 }),
    y: z.number().int().openapi({ example: 200 }),
    w: z.number().int().min(1).openapi({ example: 320 }),
    h: z.number().int().min(1).openapi({ example: 120 }),
    content: z.unknown().openapi({ example: { text: "Hello canvas" } }),
  })
  .openapi("CreateBlockRequest");

export type CreateBlockInput = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = z
  .object({
    x: z.number().int().optional(),
    y: z.number().int().optional(),
    w: z.number().int().min(1).optional(),
    h: z.number().int().min(1).optional(),
    content: z.unknown().optional(),
  })
  .openapi("UpdateBlockRequest");

export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;

export const bulkUpdateBlocksSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: z.string().min(1),
          patch: updateBlockSchema.refine((p) => Object.keys(p).length > 0, {
            message: "Patch cannot be empty",
          }),
        })
      )
      .min(1)
      .max(200),
  })
  .openapi("BulkUpdateBlocksRequest");

export type BulkUpdateBlocksInput = z.infer<typeof bulkUpdateBlocksSchema>;

// responses (reuse Block schema from canvas.schema لو أنت عاملها هناك)
export const blockResponseSchema = z
  .object({
    message: z.string(),
    data: blockSchema,
  })
  .openapi("BlockResponse");

export const bulkUpdateBlocksResponseSchema = z
  .object({
    message: z.string(),
    data: z.object({
        blocks: z.array(blockSchema),
    }),
  })
  .openapi("BulkUpdateBlocksResponse");
