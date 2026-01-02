/*
  Warnings:

  - A unique constraint covering the columns `[publicJoinCode]` on the table `Tournament` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "publicJoinCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_publicJoinCode_key" ON "Tournament"("publicJoinCode");
