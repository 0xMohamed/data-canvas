import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import { canvasIdParamsSchema, createCanvasSchema, listCanvasesQuerySchema, updateCanvasSchema } from "./canvas.schema";
import { create, getById, list, remove, update } from "./canvas.controller";
import { validateQuery } from "../../middlewares/validateQuery";
import { validateParams } from "../../middlewares/validateParams";
import { bulkUpdate, create as createBlock } from "../blocks/block.controller";
import { bulkUpdateBlocksSchema, createBlockSchema } from "../blocks/block.schema";

const router = Router();

router.get("/", requireAuth, validateQuery(listCanvasesQuerySchema), list);
router.post("/", requireAuth, validate(createCanvasSchema), create);
router.get("/:id", requireAuth, validateParams(canvasIdParamsSchema), getById);
router.delete("/:id", requireAuth, remove);
router.patch(
    "/:id",
    requireAuth,
    validateParams(canvasIdParamsSchema),
    validate(updateCanvasSchema),
    update
);

router.post(
    "/:id/blocks",
    requireAuth,
    validateParams(canvasIdParamsSchema),
    validate(createBlockSchema),
    createBlock
);
router.patch(
    "/:id/blocks",
    requireAuth,
    validateParams(canvasIdParamsSchema),
    validate(bulkUpdateBlocksSchema),
    bulkUpdate
);

export default router;
