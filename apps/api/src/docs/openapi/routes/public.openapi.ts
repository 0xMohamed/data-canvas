import { registry } from "../registry";
import { z } from "../zod";
import { documentResponseSchema } from "../../../modules/documents/documents.schema";
import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

const publicTokenParamsSchema = z
  .object({ token: z.string().min(10) })
  .openapi("PublicTokenParams");

registry.registerPath({
  method: "get",
  path: "/public/documents/{token}",
  tags: ["Public"],
  summary: "Get public document (snapshot + meta)",
  request: { params: publicTokenParamsSchema },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({ data: documentResponseSchema }),
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
