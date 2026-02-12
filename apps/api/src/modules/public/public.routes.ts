import { Router } from "express";
import { validateParams } from "../../middlewares/validateParams";
import { z } from "zod";
import { getPublicDocumentByToken } from "./public.controller";

const router = Router();

const publicTokenParamsSchema = z.object({
  token: z.string().min(10),
});

router.get(
  "/documents/:token",
  validateParams(publicTokenParamsSchema),
  getPublicDocumentByToken
);

export default router;
