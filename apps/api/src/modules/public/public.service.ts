import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export async function getPublicDocument(publicToken: string) {
  const doc = await prisma.document.findFirst({
    where: {
      publicToken,
      isPublic: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      revision: true,
      data: true,
    },
  });

  if (!doc) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Public document not found",
    });
  }

  return doc;
}
