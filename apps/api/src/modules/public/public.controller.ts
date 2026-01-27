import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPublicCanvasWithBlocks } from "./public.service";

export const getPublicCanvas = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token;

    const data = await getPublicCanvasWithBlocks(token);

    return res.status(200).json({ data });
});
