"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateBlocks = exports.deleteBlock = exports.updateBlock = exports.createBlock = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../utils/AppError");
const createBlock = async (ownerId, canvasId, input) => {
    const canvas = await prisma_1.prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: { id: true },
    });
    if (!canvas) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Canvas not found",
        });
    }
    const block = await prisma_1.prisma.block.create({
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
exports.createBlock = createBlock;
const updateBlock = async (ownerId, blockId, input) => {
    const block = await prisma_1.prisma.block.findUnique({
        where: { id: blockId },
        select: {
            id: true,
            canvas: {
                select: { ownerId: true },
            },
        },
    });
    if (!block || block.canvas.ownerId !== ownerId) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Block not found",
        });
    }
    const updated = await prisma_1.prisma.block.update({
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
exports.updateBlock = updateBlock;
const deleteBlock = async (ownerId, blockId) => {
    const block = await prisma_1.prisma.block.findUnique({
        where: { id: blockId },
        select: {
            id: true,
            canvas: {
                select: { ownerId: true },
            },
        },
    });
    if (!block || block.canvas.ownerId !== ownerId) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Block not found",
        });
    }
    await prisma_1.prisma.block.delete({
        where: { id: blockId },
    });
};
exports.deleteBlock = deleteBlock;
const bulkUpdateBlocks = async (ownerId, canvasId, input) => {
    const canvas = await prisma_1.prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: { id: true },
    });
    if (!canvas) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Canvas not found",
        });
    }
    const ids = input.updates.map((u) => u.id);
    const found = await prisma_1.prisma.block.findMany({
        where: { id: { in: ids }, canvasId },
        select: { id: true },
    });
    if (found.length !== ids.length) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "One or more blocks not found in this canvas",
        });
    }
    const results = await prisma_1.prisma.$transaction(async (tx) => {
        await Promise.all(input.updates.map((u) => tx.block.update({
            where: { id: u.id },
            data: u.patch,
        })));
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
exports.bulkUpdateBlocks = bulkUpdateBlocks;
