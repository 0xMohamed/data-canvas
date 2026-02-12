"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
registry_1.registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
registry_1.registry.registerComponent("securitySchemes", "RefreshCookie", {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
});
require("./routes/auth.openapi");
require("./routes/canvas.openapi");
require("./routes/blocks.openapi");
require("./routes/public.openapi");
