import { prisma } from "../../lib/prisma";
import { generatePublicToken } from "../../lib/publicToken";
import { AppError } from "../../utils/AppError";
import type { CreateCanvasInput, ListCanvasesQuery } from "./canvas.schema";

export const createCanvas = async (ownerId: string, input: CreateCanvasInput) => {
    const canvas = await prisma.canvas.create({
        data: {
            ownerId,
            title: input.title,
            description: input.description,
            isPublic: input.isPublic ?? false,
        },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            publicToken: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return canvas;
};


export const listCanvases = async (ownerId: string, query: ListCanvasesQuery) => {
    const { page, limit, q } = query;

    const where = {
        ownerId,
        ...(q
        ? {
            title: {
                contains: q,
                mode: "insensitive" as const,
            },
            }
        : {}),
    };

    const [items, total] = await Promise.all([
        prisma.canvas.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            publicToken: true,
            createdAt: true,
            updatedAt: true,
        },
        }),
        prisma.canvas.count({ where }),
    ]);

    return {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

export const getCanvasWithBlocksById = async (ownerId: string, canvasId: string) => {
    const canvas = await prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            publicToken: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            blocks: {
            orderBy: { updatedAt: "asc" }, // ترتيب ثابت (ممكن تغيره لاحقًا)
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
            message: "Canvas not found",
        });
    }

    const { blocks, ...canvasMeta } = canvas;
    return { canvas: canvasMeta, blocks };
};

export const updateCanvas = async (ownerId: string, canvasId: string, input: UpdateCanvasInput) => {
    const existing = await prisma.canvas.findFirst({
        where: { id: canvasId, ownerId },
        select: { id: true, publicToken: true, isPublic: true },
    });

    if (!existing) {
        throw new AppError({
        status: 404,
        code: "NOT_FOUND",
        message: "Canvas not found",
        });
    }

    const data: any = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description; // قد تكون null
    if (input.isPublic !== undefined) data.isPublic = input.isPublic;

    // ✅ publish logic: لما تتحول public لأول مرة
    if (input.isPublic === true && !existing.publicToken) {
        data.publicToken = generatePublicToken();
    }

    // ✅ لو unpublish، نخلي token موجود (لينك قديم مش شغال لو isPublic=false)
    // تقدر لاحقًا تمسحه لو عايز.

    const updated = await prisma.canvas.update({
        where: { id: canvasId },
        data,
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            publicToken: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updated;
};

export const deleteCanvas = async (canvasId: string, userId: string) => {
    const canvas = await prisma.canvas.findUnique({
        where: { id: canvasId },
        select: { id: true, ownerId: true },
    });

    if (!canvas) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Canvas not found",
        });
    }

    if (canvas.ownerId !== userId) {
        throw new AppError({
            status: 403,
            code: "FORBIDDEN",
            message: "You do not have access to this canvas",
        });
    }

    await prisma.canvas.delete({ where: { id: canvasId } });
};
