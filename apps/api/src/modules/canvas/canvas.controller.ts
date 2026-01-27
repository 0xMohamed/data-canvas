import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import type { CanvasIdParams, CreateCanvasInput, ListCanvasesQuery, UpdateCanvasInput } from "./canvas.schema";
import { createCanvas, getCanvasWithBlocksById, listCanvases, updateCanvas } from "./canvas.service";
import { AppError } from "../../utils/AppError";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateCanvasInput;

    const ownerId = req.user!.id;
    const canvas = await createCanvas(ownerId, body);

    return res.status(201).json({
        message: "Canvas created",
        data: canvas,
    });
});

export const list = asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const query = req.query as unknown as ListCanvasesQuery;

    const data = await listCanvases(ownerId, query);

    return res.status(200).json({ data });
});

export const getById = asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const { id } = req.params as unknown as CanvasIdParams;

    const data = await getCanvasWithBlocksById(ownerId, id);

    return res.status(200).json({ data });
});

export const update = asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const { id } = req.params as unknown as CanvasIdParams;
    const body = req.body as UpdateCanvasInput;

    const canvas = await updateCanvas(ownerId, id, body);

    return res.status(200).json({
        message: "Canvas updated",
        data: canvas,
    });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
      throw new AppError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Missing canvas id",
      });
    }

    await deleteCanvas(id, req.user!.id);

    return res.status(204).send();
});