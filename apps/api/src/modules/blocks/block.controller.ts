import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import type { BlockIdParams, BulkUpdateBlocksInput, CreateBlockInput, UpdateBlockInput } from "./block.schema";
import { bulkUpdateBlocks, createBlock, deleteBlock, updateBlock } from "./block.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const canvasId = req.params.id;
    const body = req.body as CreateBlockInput;

    const block = await createBlock(ownerId, canvasId, body);

    return res.status(201).json({
        message: "Block created",
        data: block,
    });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const { blockId } = req.params as unknown as BlockIdParams;
    const body = req.body as UpdateBlockInput;

    const block = await updateBlock(ownerId, blockId, body);

    return res.status(200).json({
        message: "Block updated",
        data: block,
    });
});

export const remove = asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const { blockId } = req.params as unknown as BlockIdParams;

    await deleteBlock(ownerId, blockId);

    return res.status(204).send();
});

export const bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const canvasId = req.params.id;
    const body = req.body as BulkUpdateBlocksInput;

    const blocks = await bulkUpdateBlocks(ownerId, canvasId, body);

    return res.status(200).json({
        message: "Blocks updated",
        data: { blocks },
    });
});   