"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCanvas = exports.updateCanvas = exports.listCanvases = exports.createCanvas = void 0;
const prisma_1 = require("../../lib/prisma");
const publicToken_1 = require("../../lib/publicToken");
const AppError_1 = require("../../utils/AppError");
const createCanvas = async (ownerId, input) => {
    const doc = await prisma_1.prisma.document.create({
        data: {
            ownerId,
            title: input.title,
            description: input.description ?? null,
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
    return doc;
};
exports.createCanvas = createCanvas;
const listCanvases = async (ownerId, query) => {
    const { page, limit, q } = query;
    const where = {
        ownerId,
        ...(q
            ? {
                title: {
                    contains: q,
                    mode: "insensitive",
                },
            }
            : {}),
    };
    const [items, total] = await Promise.all([
        prisma_1.prisma.document.findMany({
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
        prisma_1.prisma.document.count({ where }),
    ]);
    return {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};
exports.listCanvases = listCanvases;
const updateCanvas = async (ownerId, documentId, input) => {
    const existing = await prisma_1.prisma.document.findFirst({
        where: { id: documentId, ownerId },
        select: { id: true, publicToken: true, isPublic: true },
    });
    if (!existing) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Document not found",
        });
    }
    const data = {};
    if (input.title !== undefined)
        data.title = input.title;
    if (input.description !== undefined)
        data.description = input.description;
    if (input.isPublic !== undefined)
        data.isPublic = input.isPublic;
    if (input.isPublic === true && !existing.publicToken) {
        data.publicToken = (0, publicToken_1.generatePublicToken)();
    }
    const updated = await prisma_1.prisma.document.update({
        where: { id: documentId },
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
exports.updateCanvas = updateCanvas;
const deleteCanvas = async (documentId, userId) => {
    const doc = await prisma_1.prisma.document.findUnique({
        where: { id: documentId },
        select: { id: true, ownerId: true },
    });
    if (!doc) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Document not found",
        });
    }
    if (doc.ownerId !== userId) {
        throw new AppError_1.AppError({
            status: 403,
            code: "FORBIDDEN",
            message: "You do not have access to this document",
        });
    }
    await prisma_1.prisma.document.delete({ where: { id: documentId } });
};
exports.deleteCanvas = deleteCanvas;
