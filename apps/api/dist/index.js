"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const canvas_routes_1 = __importDefault(require("./modules/canvas/canvas.routes"));
const documents_routes_1 = __importDefault(require("./modules/documents/documents.routes"));
const public_routes_1 = __importDefault(require("./modules/public/public.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notFound_1 = require("./middlewares/notFound");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const document_1 = require("./docs/openapi/document");
require("./docs/openapi/registerRoutes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
app.use("/auth", auth_routes_1.default);
app.use("/canvases", canvas_routes_1.default);
app.use("/documents", documents_routes_1.default);
app.use("/public", public_routes_1.default);
app.get("/openapi.json", (_req, res) => {
    const doc = (0, document_1.generateOpenApiDocument)();
    res.json(doc);
});
app.use("/docs", swagger_ui_express_1.default.serve, (req, res, next) => {
    const doc = (0, document_1.generateOpenApiDocument)();
    return swagger_ui_express_1.default.setup(doc)(req, res, next);
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    console.log(`API running on http://localhost:${env_1.env.PORT}`);
});
