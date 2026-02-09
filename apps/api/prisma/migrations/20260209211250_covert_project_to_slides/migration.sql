/*
  Warnings:

  - You are about to drop the column `canvasId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `h` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `w` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the `Canvas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `slideId` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_canvasId_fkey";

-- DropForeignKey
ALTER TABLE "Canvas" DROP CONSTRAINT "Canvas_ownerId_fkey";

-- DropIndex
DROP INDEX "Block_canvasId_idx";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "canvasId",
DROP COLUMN "h",
DROP COLUMN "w",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "slideId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Canvas";

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publicToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_publicToken_key" ON "Document"("publicToken");

-- CreateIndex
CREATE INDEX "Slide_documentId_order_idx" ON "Slide"("documentId", "order");

-- CreateIndex
CREATE INDEX "Block_slideId_idx" ON "Block"("slideId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "Slide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
