import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import type {
  DocumentIdParams,
  ListDocumentsQuery,
  CreateDocumentInput,
  UpdateDocumentMetadataInput,
  UpdateDocumentSnapshotInput,
} from "./documents.schema";
import {
  listDocuments,
  createDocument,
  getDocument,
  updateDocumentMetadata,
  updateDocumentSnapshot,
  deleteDocument,
} from "./documents.service";
import { AppError } from "../../utils/AppError";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const query = req.validatedQuery as ListDocumentsQuery;
  const data = await listDocuments(userId, query);
  return res.status(200).json({ data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const body = req.body as CreateDocumentInput;
  const data = await createDocument(userId, body);
  return res.status(201).json({ message: "Document created", data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params as unknown as DocumentIdParams;
  const data = await getDocument(userId, id);
  return res.status(200).json(data);
});

export const updateMetadata = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as unknown as DocumentIdParams;
    const body = req.body as UpdateDocumentMetadataInput;
    const data = await updateDocumentMetadata(userId, id, body);
    return res.status(200).json({ message: "Document updated", data });
  },
);

export const updateSnapshot = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as unknown as DocumentIdParams;
    const body = req.body as UpdateDocumentSnapshotInput;
    const data = await updateDocumentSnapshot(userId, id, body);
    return res.status(200).json(data);
  },
);

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Missing document id",
    });
  }
  await deleteDocument(id, req.user!.id);
  return res.status(204).send();
});
