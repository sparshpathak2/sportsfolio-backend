import prisma from "../../lib/prisma.js";
import { generateCode } from "../../utils/generateCode.utils.js";

export const createTournament = async (data) => {
    // 1️⃣ Date validation
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        throw new Error("INVALID_DATE_RANGE");
    }

    // 2️⃣ Tournament rules validation (NEW)
    if (data.rules) {
        if (!data.rules.playAreas || data.rules.playAreas < 1) {
            throw new Error("INVALID_PLAY_AREAS");
        }

        if (!data.rules.partsPerMatch || data.rules.partsPerMatch < 1) {
            throw new Error("INVALID_PARTS_PER_MATCH");
        }

        if (
            !Array.isArray(data.rules.daysOfWeek) ||
            data.rules.daysOfWeek.length === 0
        ) {
            throw new Error("DAYS_OF_WEEK_REQUIRED");
        }
    }

    // 3️⃣ Transactional creation
    return prisma.$transaction(async (tx) => {
        // Create tournament
        const tournament = await tx.tournament.create({
            data: {
                name: data.name,
                sportCode: data.sportCode,
                tournamentType: data.tournamentType,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                locationId: data.locationId,
                scheduleType: data.scheduleType || "MANUAL",
                isPublic: data.isPublic ?? false,
                entryFee: data.entryFee ?? 0,
                publicJoinCode: data.isPublic
                    ? generateCode()
                    : undefined,
            },
        });

        // Create rules (optional)
        if (data.rules) {
            await tx.tournamentRules.create({
                data: {
                    tournamentId: tournament.id,

                    playAreas: data.rules.playAreas,
                    matchesPerPlayAreaPerDay:
                        data.rules.matchesPerPlayAreaPerDay,
                    reportingTimeMinutes:
                        data.rules.reportingTimeMinutes,

                    partsPerMatch: data.rules.partsPerMatch,
                    gameType: data.rules.gameType,

                    groupsCount: data.rules.groupsCount ?? null,
                    teamsPerGroup: data.rules.teamsPerGroup ?? null,

                    enableQuarterFinal:
                        data.rules.enableQuarterFinal ?? false,
                    enableSemiFinal:
                        data.rules.enableSemiFinal ?? false,
                    enableFinal:
                        data.rules.enableFinal ?? true,

                    daysOfWeek: data.rules.daysOfWeek,
                    extraConfig: data.rules.extraConfig ?? undefined,
                },
            });
        }

        // Return tournament with rules
        return tx.tournament.findUnique({
            where: { id: tournament.id },
            include: { rules: true },
        });
    });
};


export const listTournaments = async () => {
    return prisma.tournament.findMany({
        include: {
            rules: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

export const getTournament = async (id) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            rules: true,
            participants: true,
            matches: true,
            assets: true,
        },
    });

    if (!tournament) {
        throw new Error("TOURNAMENT_NOT_FOUND");
    }

    return tournament;
};


export const updateTournament = async (id, data) => {
    const existing = await prisma.tournament.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("TOURNAMENT_NOT_FOUND");
    }

    if (existing.status === "ONGOING" || existing.status === "COMPLETED") {
        throw new Error("TOURNAMENT_LOCKED");
    }

    if (data.endDate && data.startDate) {
        if (new Date(data.endDate) < new Date(data.startDate)) {
            throw new Error("INVALID_DATE_RANGE");
        }
    }

    return prisma.tournament.update({
        where: { id },
        data: {
            name: data.name,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            status: data.status,
            isPublic: data.isPublic,
            entryFee: data.entryFee,
            scheduleType: data.scheduleType,
        },
    });
};


export const deleteTournament = async (id) => {
    const existing = await prisma.tournament.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("TOURNAMENT_NOT_FOUND");
    }

    if (existing.status !== "DRAFT") {
        throw new Error("TOURNAMENT_CANNOT_BE_DELETED");
    }

    return prisma.tournament.delete({
        where: { id },
    });
};


/**
 * Tournament Rules
 */
export const upsertTournamentRules = async (tournamentId, rules) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });

    if (!tournament) {
        throw new Error("TOURNAMENT_NOT_FOUND");
    }

    return prisma.tournamentRules.upsert({
        where: { tournamentId },
        update: {
            playAreas: rules.playAreas,
            matchesPerPlayAreaPerDay: rules.matchesPerPlayAreaPerDay,
            reportingTimeMinutes: rules.reportingTimeMinutes,
            partsPerMatch: rules.partsPerMatch,
            gameType: rules.gameType,
            groupsCount: rules.groupsCount,
            teamsPerGroup: rules.teamsPerGroup,
            enableQuarterFinal: rules.enableQuarterFinal,
            enableSemiFinal: rules.enableSemiFinal,
            enableFinal: rules.enableFinal,
            daysOfWeek: rules.daysOfWeek,
            extraConfig: rules.extraConfig,
        },
        create: {
            tournamentId,
            playAreas: rules.playAreas,
            matchesPerPlayAreaPerDay: rules.matchesPerPlayAreaPerDay,
            reportingTimeMinutes: rules.reportingTimeMinutes,
            partsPerMatch: rules.partsPerMatch,
            gameType: rules.gameType,
            groupsCount: rules.groupsCount,
            teamsPerGroup: rules.teamsPerGroup,
            enableQuarterFinal: rules.enableQuarterFinal,
            enableSemiFinal: rules.enableSemiFinal,
            enableFinal: rules.enableFinal,
            daysOfWeek: rules.daysOfWeek,
            extraConfig: rules.extraConfig,
        },
    });
};

