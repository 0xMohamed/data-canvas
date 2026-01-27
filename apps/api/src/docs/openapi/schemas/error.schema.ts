import { z } from "../zod";

export const errorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
]);

export const errorEnvelopeSchema = z
  .object({
    error: z.object({
      code: errorCodeSchema,
      message: z.string(),
      details: z.unknown().nullable().optional(),
    }),
  })
  .openapi("ErrorEnvelope");
