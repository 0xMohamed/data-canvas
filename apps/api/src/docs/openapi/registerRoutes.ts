import { registry } from "./registry";

registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

registry.registerComponent("securitySchemes", "RefreshCookie", {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
});

import "./routes/auth.openapi";
import "./routes/canvas.openapi";
import "./routes/blocks.openapi";
import "./routes/public.openapi";
