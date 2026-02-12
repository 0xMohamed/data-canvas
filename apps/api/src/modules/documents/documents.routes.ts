import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import { validateParams } from "../../middlewares/validateParams";
import { validateQuery } from "../../middlewares/validateQuery";
import {
  documentIdParamsSchema,
  listDocumentsQuerySchema,
  createDocumentSchema,
  updateDocumentMetadataSchema,
  updateDocumentSnapshotSchema,
} from "./documents.schema";
import {
  list,
  create,
  getById,
  updateMetadata,
  updateSnapshot,
  remove,
} from "./documents.controller";

const router = Router();

router.get("/", requireAuth, validateQuery(listDocumentsQuerySchema), list);
router.post("/", requireAuth, validate(createDocumentSchema), create);
router.get(
  "/:id",
  requireAuth,
  validateParams(documentIdParamsSchema),
  getById
);
router.patch(
  "/:id",
  requireAuth,
  validateParams(documentIdParamsSchema),
  validate(updateDocumentMetadataSchema),
  updateMetadata
);
router.put(
  "/:id",
  requireAuth,
  validateParams(documentIdParamsSchema),
  validate(updateDocumentSnapshotSchema),
  updateSnapshot
);
router.delete(
  "/:id",
  requireAuth,
  validateParams(documentIdParamsSchema),
  remove
);

export default router;
