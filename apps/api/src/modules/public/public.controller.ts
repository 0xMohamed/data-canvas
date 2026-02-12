import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPublicDocument } from "./public.service";

export const getPublicDocumentByToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const data = await getPublicDocument(token);
  return res.status(200).json({ data });
});
