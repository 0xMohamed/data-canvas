import { z } from "../../docs/openapi/zod";
import { blockSchema } from "../blocks/block.schema";

// params
export const canvasIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("CanvasIdParams");

export type CanvasIdParams = z.infer<typeof canvasIdParamsSchema>;

// requests
export const createCanvasSchema = z
  .object({
    title: z.string().min(1).max(120).openapi({ example: "My first canvas" }),
    description: z.string().max(500).nullable().optional().openapi({ example: "test" }),
    isPublic: z.boolean().optional().openapi({ example: false }),
  })
  .openapi("CreateCanvasRequest");

export type CreateCanvasInput = z.infer<typeof createCanvasSchema>;

export const updateCanvasSchema = z
  .object({
    title: z.string().min(1).max(120).optional().openapi({ example: "New title" }),
    description: z.string().max(500).nullable().optional().openapi({ example: null }),
    isPublic: z.boolean().optional().openapi({ example: true }),
  })
  .openapi("UpdateCanvasRequest");

export type UpdateCanvasInput = z.infer<typeof updateCanvasSchema>;

// query (list)
export const listCanvasesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
    limit: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    q: z.string().trim().min(1).optional().openapi({ example: "demo" }),
  })
  .openapi("ListCanvasesQuery");

export type ListCanvasesQuery = z.infer<typeof listCanvasesQuerySchema>;

// shared schemas
export const canvasSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    isPublic: z.boolean(),
    publicToken: z.string().nullable(),
    ownerId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Canvas");

// responses
export const createCanvasResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Canvas created" }),
    data: canvasSchema,
  })
  .openapi("CreateCanvasResponse");

export const updateCanvasResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Canvas updated" }),
    data: canvasSchema,
  })
  .openapi("UpdateCanvasResponse");

export const listCanvasesResponseSchema = z
  .object({
    data: z.object({
      items: z.array(canvasSchema),
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .openapi("ListCanvasesResponse");

export const getCanvasWithBlocksResponseSchema = z
  .object({
    data: z.object({
      canvas: canvasSchema,
      blocks: z.array(blockSchema),
    }),
  })
  .openapi("GetCanvasWithBlocksResponse");
