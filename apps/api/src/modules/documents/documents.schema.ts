import { z } from "../../docs/openapi/zod";

export const documentIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("DocumentIdParams");

export type DocumentIdParams = z.infer<typeof documentIdParamsSchema>;

// List query
export const listDocumentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().min(1).optional(),
  })
  .openapi("ListDocumentsQuery");

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

// Create body
export const createDocumentSchema = z
  .object({
    title: z.string().min(1).max(120).openapi({ example: "My document" }),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional().default(false),
  })
  .openapi("CreateDocumentRequest");

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// Update metadata body (PATCH)
export const updateDocumentMetadataSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional(),
  })
  .openapi("UpdateDocumentMetadataRequest");

export type UpdateDocumentMetadataInput = z.infer<typeof updateDocumentMetadataSchema>;

// Snapshot update body (PUT)
export const updateDocumentSnapshotSchema = z
  .object({
    baseRevision: z.number().int().min(0),
    data: z.unknown(),
  })
  .openapi("UpdateDocumentSnapshotRequest");

export type UpdateDocumentSnapshotInput = z.infer<typeof updateDocumentSnapshotSchema>;

// Shared document meta (for list items and responses)
export const documentMetaSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    isPublic: z.boolean(),
    publicToken: z.string().nullable(),
    ownerId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("DocumentMeta");

// Full document response (GET :id - includes snapshot)
export const documentResponseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    isPublic: z.boolean(),
    revision: z.number().int(),
    data: z.unknown().nullable(),
  })
  .openapi("DocumentResponse");

export const updateSnapshotResponseSchema = z
  .object({
    revision: z.number().int(),
    savedAt: z.string(),
  })
  .openapi("UpdateSnapshotResponse");

export const listDocumentsResponseSchema = z
  .object({
    data: z.object({
      items: z.array(documentMetaSchema),
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .openapi("ListDocumentsResponse");

export const createDocumentResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Document created" }),
    data: documentMetaSchema,
  })
  .openapi("CreateDocumentResponse");

export const updateDocumentMetadataResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Document updated" }),
    data: documentMetaSchema,
  })
  .openapi("UpdateDocumentMetadataResponse");

export const conflictErrorSchema = z
  .object({
    code: z.literal("CONFLICT"),
    message: z.string(),
    currentRevision: z.number().int().optional(),
    data: z.unknown().nullable().optional(),
  })
  .openapi("ConflictError");
