import { registry } from "../registry";
import {
  canvasIdParamsSchema,
  createCanvasSchema,
  updateCanvasSchema,
  listCanvasesQuerySchema,
  createCanvasResponseSchema,
  updateCanvasResponseSchema,
  listCanvasesResponseSchema,
  getCanvasWithBlocksResponseSchema,
} from "../../../modules/canvas/canvas.schema";

import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

// POST /canvases
registry.registerPath({
  method: "post",
  path: "/canvases",
  tags: ["Canvases"],
  summary: "Create canvas",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createCanvasSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": { schema: createCanvasResponseSchema },
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
  },
});

// GET /canvases
registry.registerPath({
  method: "get",
  path: "/canvases",
  tags: ["Canvases"],
  summary: "List canvases",
  security: [{ BearerAuth: [] }],
  request: {
    query: listCanvasesQuerySchema,
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: listCanvasesResponseSchema },
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
  },
});

// GET /canvases/:id
registry.registerPath({
  method: "get",
  path: "/canvases/{id}",
  tags: ["Canvases"],
  summary: "Get canvas with blocks",
  security: [{ BearerAuth: [] }],
  request: {
    params: canvasIdParamsSchema,
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: getCanvasWithBlocksResponseSchema },
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

// PATCH /canvases/:id
registry.registerPath({
  method: "patch",
  path: "/canvases/{id}",
  tags: ["Canvases"],
  summary: "Update canvas",
  security: [{ BearerAuth: [] }],
  request: {
    params: canvasIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: updateCanvasSchema },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: updateCanvasResponseSchema },
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

// DELETE /canvases/:id
registry.registerPath({
    method: "delete",
    path: "/canvases/{id}",
    tags: ["Canvases"],
    summary: "Delete canvas",
    security: [{ BearerAuth: [] }],
    request: {
      params: canvasIdParamsSchema,
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
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorEnvelopeSchema,
            example: errorExamples.forbidden,
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
  