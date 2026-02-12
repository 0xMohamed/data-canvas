"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCanvasWithBlocks = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../utils/AppError");
const getPublicCanvasWithBlocks = async (publicToken) => {
    const canvas = await prisma_1.prisma.canvas.findFirst({
        where: {
            publicToken,
            isPublic: true,
        },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            publicToken: true,
            createdAt: true,
            updatedAt: true,
            blocks: {
                orderBy: { updatedAt: "asc" },
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
            },
        },
    });
    if (!canvas) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Public canvas not found",
        });
    }
    const { blocks, ...canvasMeta } = canvas;
    return { canvas: canvasMeta, blocks };
};
exports.getPublicCanvasWithBlocks = getPublicCanvasWithBlocks;
