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
import "./routes/documents.openapi";
import "./routes/public.openapi";
