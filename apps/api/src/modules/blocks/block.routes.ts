import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validateParams } from "../../middlewares/validateParams";
import { blockIdParamsSchema, updateBlockSchema } from "./block.schema";
import { validate } from "../../middlewares/validate";
import { remove, update } from "../blocks/block.controller";

const router = Router();

router.patch(
    "/:blockId",
    requireAuth,
    validateParams(blockIdParamsSchema),
    validate(updateBlockSchema),
    update
);
router.delete(
    "/:blockId",
    requireAuth,
    validateParams(blockIdParamsSchema),
    remove
);

export default router;
