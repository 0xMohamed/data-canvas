"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../registry");
const auth_schema_1 = require("../../../modules/auth/auth.schema");
const error_schema_1 = require("../schemas/error.schema");
const error_examples_1 = require("../schemas/error.examples");
// POST /auth/register
registry_1.registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "Register a new user",
    request: {
        body: {
            content: {
                "application/json": { schema: auth_schema_1.registerSchema },
            },
        },
    },
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": { schema: auth_schema_1.registerResponseSchema },
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
        409: {
            description: "Conflict",
            content: {
                "application/json": {
                    schema: error_schema_1.errorEnvelopeSchema,
                    example: error_examples_1.errorExamples.conflict,
                },
            },
        },
    },
});
// POST /auth/login
registry_1.registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Login (access token + refresh cookie)",
    request: {
        body: {
            content: {
                "application/json": { schema: auth_schema_1.loginSchema },
            },
        },
    },
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: auth_schema_1.loginResponseSchema },
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
// POST /auth/refresh
registry_1.registry.registerPath({
    method: "post",
    path: "/auth/refresh",
    tags: ["Auth"],
    summary: "Refresh access token (using refreshToken cookie)",
    security: [{ RefreshCookie: [] }],
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: auth_schema_1.refreshResponseSchema },
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
// POST /auth/logout
registry_1.registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Auth"],
    summary: "Logout (clears refresh cookie)",
    security: [{ RefreshCookie: [] }],
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: auth_schema_1.logoutResponseSchema },
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
// GET /auth/me
registry_1.registry.registerPath({
    method: "get",
    path: "/auth/me",
    tags: ["Auth"],
    summary: "Get current user (access token)",
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: "OK",
            content: {
                "application/json": { schema: auth_schema_1.meResponseSchema },
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
