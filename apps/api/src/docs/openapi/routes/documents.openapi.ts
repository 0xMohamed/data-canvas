import { registry } from "../registry";
import {
  documentIdParamsSchema,
  listDocumentsQuerySchema,
  createDocumentSchema,
  updateDocumentMetadataSchema,
  updateDocumentSnapshotSchema,
  documentResponseSchema,
  listDocumentsResponseSchema,
  createDocumentResponseSchema,
  updateDocumentMetadataResponseSchema,
  updateSnapshotResponseSchema,
} from "../../../modules/documents/documents.schema";
import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

// GET /documents
registry.registerPath({
  method: "get",
  path: "/documents",
  tags: ["Documents"],
  summary: "List documents",
  security: [{ BearerAuth: [] }],
  request: { query: listDocumentsQuerySchema },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: listDocumentsResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
  },
});

// POST /documents
registry.registerPath({
  method: "post",
  path: "/documents",
  tags: ["Documents"],
  summary: "Create document",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createDocumentSchema } } },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: createDocumentResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.validation } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
  },
});

// GET /documents/:id
registry.registerPath({
  method: "get",
  path: "/documents/{id}",
  tags: ["Documents"],
  summary: "Get document (snapshot + meta)",
  security: [{ BearerAuth: [] }],
  request: { params: documentIdParamsSchema },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: documentResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.forbidden } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.notFound } },
    },
  },
});

// PATCH /documents/:id
registry.registerPath({
  method: "patch",
  path: "/documents/{id}",
  tags: ["Documents"],
  summary: "Update document metadata",
  security: [{ BearerAuth: [] }],
  request: {
    params: documentIdParamsSchema,
    body: {
      content: { "application/json": { schema: updateDocumentMetadataSchema } },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: updateDocumentMetadataResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.validation } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.notFound } },
    },
  },
});

// PUT /documents/:id
registry.registerPath({
  method: "put",
  path: "/documents/{id}",
  tags: ["Documents"],
  summary: "Update document snapshot (with revision check)",
  security: [{ BearerAuth: [] }],
  request: {
    params: documentIdParamsSchema,
    body: {
      content: { "application/json": { schema: updateDocumentSnapshotSchema } },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: updateSnapshotResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.notFound } },
    },
    409: {
      description: "Conflict (revision mismatch)",
      content: { "application/json": { schema: errorEnvelopeSchema } },
    },
  },
});

// DELETE /documents/:id
registry.registerPath({
  method: "delete",
  path: "/documents/{id}",
  tags: ["Documents"],
  summary: "Delete document",
  security: [{ BearerAuth: [] }],
  request: { params: documentIdParamsSchema },
  responses: {
    204: { description: "No Content" },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.unauthorized } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.forbidden } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorEnvelopeSchema, example: errorExamples.notFound } },
    },
  },
});
