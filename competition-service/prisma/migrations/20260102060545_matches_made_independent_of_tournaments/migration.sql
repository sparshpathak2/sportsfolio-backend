/*
  Warnings:

  - You are about to drop the column `matchNumber` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `round` on the `Match` table. All the data in the column will be lost.
  - Added the required column `gameType` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officialUserId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partsCount` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playArea` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "matchNumber",
DROP COLUMN "round",
ADD COLUMN     "gameType" "GameType" NOT NULL,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "officialUserId" TEXT NOT NULL,
ADD COLUMN     "partsCount" INTEGER NOT NULL,
ADD COLUMN     "playArea" INTEGER NOT NULL,
ADD COLUMN     "servingParticipantId" TEXT,
ALTER COLUMN "tournamentId" DROP NOT NULL;
