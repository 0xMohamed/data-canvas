"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../registry");
const canvas_schema_1 = require("../../../modules/canvas/canvas.schema");
const block_schema_1 = require("../../../modules/blocks/block.schema");
const error_schema_1 = require("../schemas/error.schema");
const error_examples_1 = require("../schemas/error.examples");
// POST /canvases/:id/blocks
registry_1.registry.registerPath({
    method: "post",
    path: "/canvases/{id}/blocks",
    tags: ["Blocks"],
    summary: "Create block in canvas",
    security: [{ BearerAuth: [] }],
    request: {
        params: canvas_schema_1.canvasIdParamsSchema,
        body: {
            content: {
                "application/json": { schema: block_schema_1.createBlockSchema },
            },
        },
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": { schema: block_schema_1.blockResponseSchema },
            },
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.validation,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.unauthorized,
                },
            },
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.notFound,
                },
            },
        },
    },
});
// PATCH /canvases/:id/blocks (bulk)
registry_1.registry.registerPath({
    method: "patch",
    path: "/canvases/{id}/blocks",
    tags: ["Blocks"],
    summary: "Bulk update blocks in canvas",
    security: [{ BearerAuth: [] }],
    request: {
        params: canvas_schema_1.canvasIdParamsSchema,
        body: {
            content: {
                "application/json": { schema: block_schema_1.bulkUpdateBlocksSchema },
            },
        },
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: block_schema_1.bulkUpdateBlocksResponseSchema },
            },
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.validation,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.unauthorized,
                },
            },
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.notFound,
                },
            },
        },
    },
});
// PATCH /blocks/:blockId
registry_1.registry.registerPath({
    method: "patch",
    path: "/blocks/{blockId}",
    tags: ["Blocks"],
    summary: "Update a block",
    security: [{ BearerAuth: [] }],
    request: {
        params: block_schema_1.blockIdParamsSchema,
        body: {
            content: {
                "application/json": { schema: block_schema_1.updateBlockSchema },
            },
        },
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: block_schema_1.blockResponseSchema },
            },
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.validation,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.unauthorized,
                },
            },
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.notFound,
                },
            },
        },
    },
});
// DELETE /blocks/:blockId
registry_1.registry.registerPath({
    method: "delete",
    path: "/blocks/{blockId}",
    tags: ["Blocks"],
    summary: "Delete a block",
    security: [{ BearerAuth: [] }],
    request: {
        params: block_schema_1.blockIdParamsSchema,
    },
    responses: {
        204: { description: "No Content" },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.unauthorized,
                },
            },
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.notFound,
                },
            },
        },
    },
});
