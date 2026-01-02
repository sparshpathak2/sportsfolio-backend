import prisma from "../lib/prisma.js";

/**
 * Add a participant to tournament
 * Supports PLAYER or TEAM
 */
export const addParticipant = async ({
    tournamentId,
    participantType, // "PLAYER" | "TEAM"
    playerId,
    teamId,
    seed,
}) => {
    // 1️⃣ Tournament must exist
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });

    if (!tournament) {
        throw new Error("Tournament not found");
    }

    // 2️⃣ Validate participant type
    if (participantType === "PLAYER" && !playerId) {
        throw new Error("playerId is required for PLAYER participation");
    }

    if (participantType === "TEAM" && !teamId) {
        throw new Error("teamId is required for TEAM participation");
    }

    // 3️⃣ Prevent duplicates
    const existing = await prisma.tournamentParticipant.findFirst({
        where: {
            tournamentId,
            playerId: participantType === "PLAYER" ? playerId : undefined,
            teamId: participantType === "TEAM" ? teamId : undefined,
        },
    });

    if (existing) {
        throw new Error("Participant already registered in tournament");
    }

    // 4️⃣ Create participant
    return prisma.tournamentParticipant.create({
        data: {
            tournamentId,
            playerId: participantType === "PLAYER" ? playerId : null,
            teamId: participantType === "TEAM" ? teamId : null,
            seed,
        },
    });
};

/**
 * List participants of a tournament
 */
export const listParticipants = async (tournamentId) => {
    return prisma.tournamentParticipant.findMany({
        where: { tournamentId },
        orderBy: {
            seed: "asc",
        },
    });
};

/**
 * Remove participant from tournament
 */
export const removeParticipant = async (participantId) => {
    const exists = await prisma.tournamentParticipant.findUnique({
        where: { id: participantId },
    });

    if (!exists) {
        throw new Error("Participant not found");
    }

    await prisma.tournamentParticipant.delete({
        where: { id: participantId },
    });
};
