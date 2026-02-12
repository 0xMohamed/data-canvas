"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocument = getDocument;
exports.updateDocumentSnapshot = updateDocumentSnapshot;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../utils/AppError");
async function getDocument(userId, documentId) {
    const doc = await prisma_1.prisma.document.findFirst({
        where: {
            id: documentId,
            OR: [{ ownerId: userId }, { isPublic: true }],
        },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            revision: true,
            data: true,
            ownerId: true,
        },
    });
    if (!doc) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Document not found",
        });
    }
    if (doc.ownerId !== userId && !doc.isPublic) {
        throw new AppError_1.AppError({
            status: 403,
            code: "FORBIDDEN",
            message: "You do not have access to this document",
        });
    }
    return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        isPublic: doc.isPublic,
        revision: doc.revision,
        data: doc.data,
    };
}
async function updateDocumentSnapshot(userId, documentId, input) {
    const doc = await prisma_1.prisma.document.findFirst({
        where: { id: documentId, ownerId: userId },
        select: { id: true, revision: true },
    });
    if (!doc) {
        throw new AppError_1.AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "Document not found",
        });
    }
    if (doc.revision !== input.baseRevision) {
        const current = await prisma_1.prisma.document.findUnique({
            where: { id: documentId },
            select: { revision: true, data: true },
        });
        throw new AppError_1.AppError({
            status: 409,
            code: "CONFLICT",
            message: "Document was modified by another session. Please reload.",
            details: {
                currentRevision: current?.revision,
                data: current?.data ?? null,
            },
        });
    }
    const updated = await prisma_1.prisma.document.update({
        where: { id: documentId },
        data: {
            data: input.data,
            revision: { increment: 1 },
            updatedAt: new Date(),
        },
        select: { revision: true, updatedAt: true },
    });
    return {
        revision: updated.revision,
        savedAt: updated.updatedAt.toISOString(),
    };
}
