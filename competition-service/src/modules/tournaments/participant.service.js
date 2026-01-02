import prisma from "../../lib/prisma.js";

export const joinTournamentByCode = async ({
    joinCode,
    playerId,
    teamId,
}) => {
    return prisma.$transaction(async (tx) => {
        // 1️⃣ Find tournament
        const tournament = await tx.tournament.findUnique({
            where: { publicJoinCode: joinCode },
            include: { rules: true },
        });

        if (!tournament || !tournament.isPublic) {
            throw new Error("INVALID_OR_PRIVATE_TOURNAMENT");
        }

        if (tournament.startDate <= new Date()) {
            throw new Error("TOURNAMENT_ALREADY_STARTED");
        }

        // 2️⃣ Prevent duplicate participation
        const existing = await tx.tournamentParticipant.findFirst({
            where: {
                tournamentId: tournament.id,
                OR: [
                    playerId ? { playerId } : undefined,
                    teamId ? { teamId } : undefined,
                ].filter(Boolean),
            },
        });

        if (existing) {
            throw new Error("ALREADY_JOINED");
        }

        // 3️⃣ Validate participant type vs rules (Badminton-aware)
        if (tournament.rules) {
            if (
                tournament.rules.gameType === "SINGLES" &&
                !playerId
            ) {
                throw new Error("SINGLES_REQUIRES_PLAYER");
            }

            if (
                tournament.rules.gameType === "DOUBLES" &&
                !teamId
            ) {
                throw new Error("DOUBLES_REQUIRES_TEAM");
            }
        }

        // 4️⃣ Create participant
        return tx.tournamentParticipant.create({
            data: {
                tournamentId: tournament.id,
                playerId: playerId ?? null,
                teamId: teamId ?? null,
            },
        });
    });
};


export const joinTournament = async ({ tournamentId, playerId }) => {
    if (!tournamentId) {
        throw new Error("TOURNAMENT_ID_REQUIRED");
    }

    if (!playerId) {
        throw new Error("PLAYER_ID_REQUIRED");
    }

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true },
    });

    if (!tournament) {
        throw new Error("TOURNAMENT_NOT_FOUND");
    }

    if (tournament.status !== "PUBLISHED") {
        throw new Error("TOURNAMENT_NOT_OPEN");
    }

    const alreadyJoined = await prisma.tournamentParticipant.findFirst({
        where: {
            tournamentId,
            playerId,
        },
    });

    if (alreadyJoined) {
        throw new Error("ALREADY_JOINED");
    }

    return prisma.tournamentParticipant.create({
        data: {
            tournamentId,
            playerId,
        },
    });
};
