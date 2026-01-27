import { registry } from "../registry";
import { z } from "../zod";
import { getCanvasWithBlocksResponseSchema } from "../../../modules/canvas/canvas.schema";

import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

const publicTokenParamsSchema = z
  .object({
    token: z.string().min(10),
  })
  .openapi("PublicTokenParams");

registry.registerPath({
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
        "application/json": { schema: getCanvasWithBlocksResponseSchema },
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
