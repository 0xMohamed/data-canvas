"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../registry");
const zod_1 = require("../zod");
const canvas_schema_1 = require("../../../modules/canvas/canvas.schema");
const error_schema_1 = require("../schemas/error.schema");
const error_examples_1 = require("../schemas/error.examples");
const publicTokenParamsSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(10),
})
    .openapi("PublicTokenParams");
registry_1.registry.registerPath({
    method: "get",
    path: "/public/canvases/{token}",
    tags: ["Public"],
    summary: "Get public canvas with blocks",
    request: {
        params: publicTokenParamsSchema,
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: canvas_schema_1.getCanvasWithBlocksResponseSchema },
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
