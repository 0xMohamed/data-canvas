import { Router } from "express";
import { validateParams } from "../../middlewares/validateParams";
import { z } from "zod";
import { getPublicCanvas } from "./public.controller";

const router = Router();

const publicTokenParamsSchema = z.object({
    token: z.string().min(10),
});

router.get(
    "/canvases/:token",
    validateParams(publicTokenParamsSchema),
    getPublicCanvas
);

export default router;
