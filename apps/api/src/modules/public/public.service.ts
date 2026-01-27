import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const getPublicCanvasWithBlocks = async (publicToken: string) => {
    const canvas = await prisma.canvas.findFirst({
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
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Public canvas not found",
        });
    }

    const { blocks, ...canvasMeta } = canvas;
    return { canvas: canvasMeta, blocks };
};
