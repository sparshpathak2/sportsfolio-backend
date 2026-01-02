/*
  Warnings:

  - You are about to drop the column `formatCode` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the `MatchSet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `locationId` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleType` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentType` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('SINGLES', 'DOUBLES');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('TOURNAMENT_LOGO', 'TOURNAMENT_BANNER');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "MatchSet" DROP CONSTRAINT "MatchSet_matchId_fkey";

-- DropIndex
DROP INDEX "Match_tournamentId_idx";

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "formatCode",
DROP COLUMN "location",
ADD COLUMN     "entryFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "scheduleType" "ScheduleType" NOT NULL,
ADD COLUMN     "tournamentType" "TournamentType" NOT NULL;

-- DropTable
DROP TABLE "MatchSet";

-- CreateTable
CREATE TABLE "TournamentRules" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playAreas" INTEGER NOT NULL,
    "matchesPerPlayAreaPerDay" INTEGER NOT NULL,
    "reportingTimeMinutes" INTEGER NOT NULL,
    "partsPerMatch" INTEGER NOT NULL,
    "gameType" "GameType" NOT NULL,
    "groupsCount" INTEGER,
    "teamsPerGroup" INTEGER,
    "enableQuarterFinal" BOOLEAN NOT NULL DEFAULT false,
    "enableSemiFinal" BOOLEAN NOT NULL DEFAULT false,
    "enableFinal" BOOLEAN NOT NULL DEFAULT true,
    "daysOfWeek" "WeekDay"[],
    "extraConfig" JSONB,

    CONSTRAINT "TournamentRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPart" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "p1Score" INTEGER NOT NULL DEFAULT 0,
    "p2Score" INTEGER NOT NULL DEFAULT 0,
    "winnerParticipantId" TEXT,

    CONSTRAINT "MatchPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRules_tournamentId_key" ON "TournamentRules"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPart_matchId_partNumber_key" ON "MatchPart"("matchId", "partNumber");

-- CreateIndex
CREATE INDEX "Asset_tournamentId_type_idx" ON "Asset"("tournamentId", "type");

-- CreateIndex
CREATE INDEX "Match_tournamentId_status_idx" ON "Match"("tournamentId", "status");

-- CreateIndex
CREATE INDEX "MatchParticipant_participantId_idx" ON "MatchParticipant"("participantId");

-- CreateIndex
CREATE INDEX "Tournament_sportCode_idx" ON "Tournament"("sportCode");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- AddForeignKey
ALTER TABLE "TournamentRules" ADD CONSTRAINT "TournamentRules_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerParticipantId_fkey" FOREIGN KEY ("winnerParticipantId") REFERENCES "TournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "TournamentParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPart" ADD CONSTRAINT "MatchPart_winnerParticipantId_fkey" FOREIGN KEY ("winnerParticipantId") REFERENCES "TournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPart" ADD CONSTRAINT "MatchPart_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
