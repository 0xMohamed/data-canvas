import "dotenv/config";
import { env } from "./config/env";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import canvasRoutes from "./modules/canvas/canvas.routes";
import blockRoutes from "./modules/blocks/block.routes";
import publicRoutes from "./modules/public/public.routes";

import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";

import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./docs/openapi/document";
import "./docs/openapi/registerRoutes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/canvases", canvasRoutes);
app.use("/blocks", blockRoutes);
app.use("/public", publicRoutes);

app.get("/openapi.json", (_req, res) => {
  const doc = generateOpenApiDocument();
  res.json(doc);
});

app.use("/docs", swaggerUi.serve, (req, res, next) => {
  const doc = generateOpenApiDocument();
  return swaggerUi.setup(doc)(req, res, next);
});

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
