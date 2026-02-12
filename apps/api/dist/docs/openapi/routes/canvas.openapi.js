"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../registry");
const canvas_schema_1 = require("../../../modules/canvas/canvas.schema");
const error_schema_1 = require("../schemas/error.schema");
const error_examples_1 = require("../schemas/error.examples");
// POST /canvases
registry_1.registry.registerPath({
    method: "post",
    path: "/canvases",
    tags: ["Canvases"],
    summary: "Create canvas",
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: canvas_schema_1.createCanvasSchema },
            },
        },
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": { schema: canvas_schema_1.createCanvasResponseSchema },
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
    },
});
// GET /canvases
registry_1.registry.registerPath({
    method: "get",
    path: "/canvases",
    tags: ["Canvases"],
    summary: "List canvases",
    security: [{ BearerAuth: [] }],
    request: {
        query: canvas_schema_1.listCanvasesQuerySchema,
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: canvas_schema_1.listCanvasesResponseSchema },
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
    },
});
// GET /canvases/:id
registry_1.registry.registerPath({
    method: "get",
    path: "/canvases/{id}",
    tags: ["Canvases"],
    summary: "Get canvas with blocks",
    security: [{ BearerAuth: [] }],
    request: {
        params: canvas_schema_1.canvasIdParamsSchema,
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: canvas_schema_1.getCanvasWithBlocksResponseSchema },
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
// PATCH /canvases/:id
registry_1.registry.registerPath({
    method: "patch",
    path: "/canvases/{id}",
    tags: ["Canvases"],
    summary: "Update canvas",
    security: [{ BearerAuth: [] }],
    request: {
        params: canvas_schema_1.canvasIdParamsSchema,
        body: {
            content: {
                "application/json": { schema: canvas_schema_1.updateCanvasSchema },
            },
        },
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: canvas_schema_1.updateCanvasResponseSchema },
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
// DELETE /canvases/:id
registry_1.registry.registerPath({
    method: "delete",
    path: "/canvases/{id}",
    tags: ["Canvases"],
    summary: "Delete canvas",
    security: [{ BearerAuth: [] }],
    request: {
        params: canvas_schema_1.canvasIdParamsSchema,
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
        403: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.forbidden,
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
