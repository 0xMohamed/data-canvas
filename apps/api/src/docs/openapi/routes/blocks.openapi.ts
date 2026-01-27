import { registry } from "../registry";
import { canvasIdParamsSchema } from "../../../modules/canvas/canvas.schema";
import {
  blockIdParamsSchema,
  createBlockSchema,
  updateBlockSchema,
  bulkUpdateBlocksSchema,
  blockResponseSchema,
  bulkUpdateBlocksResponseSchema,
} from "../../../modules/blocks/block.schema";

import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

// POST /canvases/:id/blocks
registry.registerPath({
  method: "post",
  path: "/canvases/{id}/blocks",
  tags: ["Blocks"],
  summary: "Create block in canvas",
  security: [{ BearerAuth: [] }],
  request: {
    params: canvasIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: createBlockSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": { schema: blockResponseSchema },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.validation,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.unauthorized,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});

// PATCH /canvases/:id/blocks (bulk)
registry.registerPath({
  method: "patch",
  path: "/canvases/{id}/blocks",
  tags: ["Blocks"],
  summary: "Bulk update blocks in canvas",
  security: [{ BearerAuth: [] }],
  request: {
    params: canvasIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: bulkUpdateBlocksSchema },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: bulkUpdateBlocksResponseSchema },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.validation,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.unauthorized,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});

// PATCH /blocks/:blockId
registry.registerPath({
  method: "patch",
  path: "/blocks/{blockId}",
  tags: ["Blocks"],
  summary: "Update a block",
  security: [{ BearerAuth: [] }],
  request: {
    params: blockIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: updateBlockSchema },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: blockResponseSchema },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.validation,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.unauthorized,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});

// DELETE /blocks/:blockId
registry.registerPath({
  method: "delete",
  path: "/blocks/{blockId}",
  tags: ["Blocks"],
  summary: "Delete a block",
  security: [{ BearerAuth: [] }],
  request: {
    params: blockIdParamsSchema,
  },
  responses: {
    204: { description: "No Content" },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.unauthorized,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});
