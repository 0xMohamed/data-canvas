import { prisma } from "../../lib/prisma";
import { generatePublicToken } from "../../lib/publicToken";
import { AppError } from "../../utils/AppError";
import type {
  CreateDocumentInput,
  ListDocumentsQuery,
  UpdateDocumentMetadataInput,
  UpdateDocumentSnapshotInput,
} from "./documents.schema";

function emptySnapshot(): object {
  return {
    slides: [
      {
        id: `slide_${Date.now().toString(36)}`,
        title: "Slide 1",
        themeId: "dark-editorial",
        blocks: [],
      },
    ],
  };
}

export async function listDocuments(
  ownerId: string,
  query: ListDocumentsQuery,
) {
  const { page, limit, q } = query;
  const where = {
    ownerId,
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.document.findMany({
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
    prisma.document.count({ where }),
  ]);
  return {
    items: items.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createDocument(
  ownerId: string,
  input: CreateDocumentInput,
) {
  const doc = await prisma.document.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description ?? null,
      isPublic: input.isPublic ?? false,
      data: emptySnapshot() as object,
      revision: 0,
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      publicToken: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return {
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getDocument(userId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
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
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Document not found",
    });
  }

  if (doc.ownerId !== userId && !doc.isPublic) {
    throw new AppError({
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

export async function updateDocumentMetadata(
  userId: string,
  documentId: string,
  input: UpdateDocumentMetadataInput,
) {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, ownerId: userId },
    select: { id: true, publicToken: true, isPublic: true },
  });

  if (!existing) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Document not found",
    });
  }

  const data: {
    title?: string;
    description?: string | null;
    isPublic?: boolean;
    publicToken?: string;
  } = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.isPublic !== undefined) data.isPublic = input.isPublic;
  if (input.isPublic === true && !existing.publicToken) {
    data.publicToken = generatePublicToken();
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      publicToken: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function updateDocumentSnapshot(
  userId: string,
  documentId: string,
  input: UpdateDocumentSnapshotInput,
) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, ownerId: userId },
    select: { id: true, revision: true },
  });

  if (!doc) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Document not found",
    });
  }

  if (doc.revision !== input.baseRevision) {
    const current = await prisma.document.findUnique({
      where: { id: documentId },
      select: { revision: true, data: true },
    });
    throw new AppError({
      status: 409,
      code: "CONFLICT",
      message: "Document was modified by another session. Please reload.",
      details: {
        currentRevision: current?.revision,
        data: current?.data ?? null,
      },
    });
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      data: input.data as object,
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

export async function deleteDocument(documentId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, ownerId: true },
  });

  if (!doc) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Document not found",
    });
  }

  if (doc.ownerId !== userId) {
    throw new AppError({
      status: 403,
      code: "FORBIDDEN",
      message: "You do not have access to this document",
    });
  }

  await prisma.document.delete({ where: { id: documentId } });
}
