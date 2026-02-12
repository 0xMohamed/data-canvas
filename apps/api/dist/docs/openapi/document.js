"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenApiDocument = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const registry_1 = require("./registry");
const generateOpenApiDocument = () => {
    const generator = new zod_to_openapi_1.OpenApiGeneratorV3(registry_1.registry.definitions);
    return generator.generateDocument({
        openapi: "3.0.3",
        info: {
            title: "Data Canvas API",
            version: "1.0.0",
            description: "Infinite canvas backend (Observable/Figma-like).",
        },
    });
};
exports.generateOpenApiDocument = generateOpenApiDocument;
