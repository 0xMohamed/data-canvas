import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { BulkUpdateBlocksInput, CreateBlockInput, UpdateBlockInput } from "./block.schema";

export const createBlock = async (ownerId: string, canvasId: string, input: CreateBlockInput) => {
    const canvas = await prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: { id: true },
    });

    if (!canvas) {
        throw new AppError({
        status: 404,
        code: "NOT_FOUND",
        message: "Canvas not found",
        });
    }

    const block = await prisma.block.create({
        data: {
            canvasId,
            type: input.type,
            x: input.x,
            y: input.y,
            w: input.w,
            h: input.h,
            content: input.content,
        },
        select: {
            id: true,
            canvasId: true,
            type: true,
            x: true,
            y: true,
            w: true,
            h: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return block;
};


export const updateBlock = async (
    ownerId: string,
    blockId: string,
    input: UpdateBlockInput
) => {
    const block = await prisma.block.findUnique({
        where: { id: blockId },
        select: {
        id: true,
        canvas: {
            select: { ownerId: true },
        },
        },
    });

    if (!block || block.canvas.ownerId !== ownerId) {
        throw new AppError({
        status: 404,
        code: "NOT_FOUND",
        message: "Block not found",
        });
    }

    const updated = await prisma.block.update({
        where: { id: blockId },
        data: {
            ...input,
        },
        select: {
            id: true,
            canvasId: true,
            type: true,
            x: true,
            y: true,
            w: true,
            h: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updated;
};


export const deleteBlock = async (ownerId: string, blockId: string) => {
    const block = await prisma.block.findUnique({
        where: { id: blockId },
        select: {
            id: true,
            canvas: {
            select: { ownerId: true },
            },
        },
    });

    if (!block || block.canvas.ownerId !== ownerId) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Block not found",
        });
    }

    await prisma.block.delete({
        where: { id: blockId },
    });
};

export const bulkUpdateBlocks = async (
    ownerId: string,
    canvasId: string,
    input: BulkUpdateBlocksInput
) => {
    const canvas = await prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: { id: true },
    });

    if (!canvas) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Canvas not found",
        });
    }

    const ids = input.updates.map((u) => u.id);

    const found = await prisma.block.findMany({
        where: { id: { in: ids }, canvasId },
        select: { id: true },
    });

    if (found.length !== ids.length) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "One or more blocks not found in this canvas",
        });
    }

    const results = await prisma.$transaction(async (tx) => {
        await Promise.all(
            input.updates.map((u) =>
                tx.block.update({
                    where: { id: u.id },
                    data: u.patch,
                })
            )
        );

        return tx.block.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                canvasId: true,
                type: true,
                x: true,
                y: true,
                w: true,
                h: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    });

    return results;
};
