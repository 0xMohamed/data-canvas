import { registry } from "../registry";

import {
  registerSchema,
  loginSchema,
  registerResponseSchema,
  loginResponseSchema,
  refreshResponseSchema,
  logoutResponseSchema,
  meResponseSchema,
} from "../../../modules/auth/auth.schema";

import { errorEnvelopeSchema } from "../schemas/error.schema";
import { errorExamples } from "../schemas/error.examples";

// POST /auth/register
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": { schema: registerResponseSchema },
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
    409: {
      description: "Conflict",
      content: {
        "application/json": {
          schema: errorEnvelopeSchema,
          example: errorExamples.conflict,
        },
      },
    },
  },
});

// POST /auth/login
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login (access token + refresh cookie)",
  request: {
    body: {
      content: {
        "application/json": { schema: loginSchema },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: loginResponseSchema },
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

// POST /auth/refresh
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token (using refreshToken cookie)",
  security: [{ RefreshCookie: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: refreshResponseSchema },
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

// POST /auth/logout
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout (clears refresh cookie)",
  security: [{ RefreshCookie: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: logoutResponseSchema },
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

// GET /auth/me
registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get current user (access token)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: meResponseSchema },
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
