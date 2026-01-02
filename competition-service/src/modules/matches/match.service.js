import prisma from "../../lib/prisma.js";
import { EngineFactory } from "../../domains/EngineFactory.js";

export const startMatch = async (matchId) => {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            tournament: { include: { rules: true } },
            participants: true,
        },
    });

    if (!match) throw new Error("Match not found");

    return prisma.match.update({
        where: { id: matchId },
        data: { status: "LIVE", startTime: new Date() },
    });
};

export const recordEvent = async ({ matchId, type, payload }) => {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            parts: true,
            participants: true, // MatchParticipant[]
        },
    });

    if (!match) throw new Error("Match not found");
    if (match.status !== "LIVE") throw new Error("Match is not live");

    const { scoringParticipantId } = payload;
    if (!scoringParticipantId) {
        throw new Error("scoringParticipantId is required");
    }

    // 🔥 FIND POSITION
    const participant = match.participants.find(
        p => p.participantId === scoringParticipantId
    );

    if (!participant) {
        throw new Error("Participant not part of this match");
    }

    const engine = EngineFactory.getScoringEngine(match.sportCode);

    const updatedState = engine.applyEvent({
        match,
        eventType: type,
        payload: {
            participantId: scoringParticipantId,
            position: participant.position, // ✅ derived
        },
    });

    await prisma.matchEvent.create({
        data: {
            matchId,
            type,
            payload,
        },
    });

    await engine.persist(prisma, updatedState);

    return updatedState;
};




// export const createMatch = async ({
//     tournamentId,
//     locationId,
//     playArea,
//     gameType,
//     partsCount,
//     startTime,
//     officialUserId,
//     participantIds,
//     servingParticipantId,
// }) => {
//     // 1️⃣ Basic validation
//     if (!locationId) throw new Error("LOCATION_REQUIRED");
//     if (!playArea) throw new Error("PLAY_AREA_REQUIRED");

//     if (participantIds.length !== 2) {
//         throw new Error("MATCH_REQUIRES_2_PARTICIPANTS");
//     }

//     if (!servingParticipantId || !participantIds.includes(servingParticipantId)) {
//         throw new Error("INVALID_SERVING_PARTICIPANT");
//     }

//     return prisma.$transaction(async (tx) => {
//         // 2️⃣ Tournament-specific validation
//         if (tournamentId) {
//             const rules = await tx.tournamentRules.findUnique({
//                 where: { tournamentId },
//             });

//             if (!rules) throw new Error("TOURNAMENT_RULES_NOT_FOUND");

//             // Default from rules if not explicitly set
//             if (!partsCount) {
//                 partsCount = rules.partsPerMatch;
//             }

//             if (partsCount > rules.partsPerMatch) {
//                 throw new Error("PARTS_EXCEED_TOURNAMENT_RULES");
//             }

//             if (rules.gameType !== gameType) {
//                 throw new Error("GAME_TYPE_MISMATCH_WITH_TOURNAMENT");
//             }

//             // Ensure participants belong to tournament
//             const validParticipants = await tx.tournamentParticipant.findMany({
//                 where: {
//                     id: { in: participantIds },
//                     // playerId: { in: participantIds },
//                     tournamentId,
//                     eliminated: false,
//                 },
//             });

//             console.log("validParticipants at createMatch service:", validParticipants)

//             if (validParticipants.length !== 2) {
//                 throw new Error("INVALID_OR_ELIMINATED_PARTICIPANT");
//             }
//         }

//         // 3️⃣ Create match
//         const match = await tx.match.create({
//             data: {
//                 tournamentId,
//                 locationId,
//                 playArea,
//                 gameType,
//                 partsCount,
//                 startTime,
//                 officialUserId,
//                 servingParticipantId,
//             },
//         });

//         // 4️⃣ Attach participants
//         await tx.matchParticipant.createMany({
//             data: participantIds.map((participantId, index) => ({
//                 matchId: match.id,
//                 participantId,
//                 position: index + 1, // 1 = P1 / Team A, 2 = P2 / Team B
//             })),
//         });

//         // 5️⃣ Pre-create match parts
//         await tx.matchPart.createMany({
//             data: Array.from({ length: partsCount }).map((_, i) => ({
//                 matchId: match.id,
//                 partNumber: i + 1,
//             })),
//         });

//         return match;
//     });
// };

export const createMatch = async ({
    tournamentId,
    locationId,
    playArea,
    gameType,
    partsCount,
    startTime,
    officialUserId,
    participantIds,
    servingParticipantId,
}) => {
    // 1️⃣ Basic validation
    if (!locationId) throw new Error("LOCATION_REQUIRED");
    if (!playArea) throw new Error("PLAY_AREA_REQUIRED");

    if (!Array.isArray(participantIds) || participantIds.length !== 2) {
        throw new Error("MATCH_REQUIRES_2_PARTICIPANTS");
    }

    if (!servingParticipantId || !participantIds.includes(servingParticipantId)) {
        throw new Error("INVALID_SERVING_PARTICIPANT");
    }

    // 2️⃣ Decide match nature
    const isQuickMatch = !tournamentId;
    const isInstantStart = !startTime;

    const matchStatus = isInstantStart ? "LIVE" : "SCHEDULED";
    const matchStartTime = startTime ?? new Date();
    // const matchStartTime = startTime ?? null;


    return prisma.$transaction(async (tx) => {
        // 3️⃣ Tournament-specific validation (ONLY if tournament match)
        if (!isQuickMatch) {
            const rules = await tx.tournamentRules.findUnique({
                where: { tournamentId },
            });

            if (!rules) throw new Error("TOURNAMENT_RULES_NOT_FOUND");

            // Default parts from rules
            const effectivePartsCount = partsCount ?? rules.partsPerMatch;

            if (effectivePartsCount > rules.partsPerMatch) {
                throw new Error("PARTS_EXCEED_TOURNAMENT_RULES");
            }

            if (rules.gameType !== gameType) {
                throw new Error("GAME_TYPE_MISMATCH_WITH_TOURNAMENT");
            }

            // Ensure participants belong to tournament
            const validParticipants = await tx.tournamentParticipant.findMany({
                where: {
                    id: { in: participantIds },
                    tournamentId,
                    eliminated: false,
                },
            });

            if (validParticipants.length !== 2) {
                throw new Error("INVALID_OR_ELIMINATED_PARTICIPANT");
            }

            partsCount = effectivePartsCount;
        }

        // 4️⃣ Defaults for quick matches
        if (isQuickMatch && !partsCount) {
            partsCount = 3; // sensible default for badminton quick match
        }

        // 5️⃣ Create match
        const match = await tx.match.create({
            data: {
                tournamentId: tournamentId ?? null,
                locationId,
                playArea,
                gameType,
                partsCount,
                startTime: matchStartTime,
                status: matchStatus,
                officialUserId,
                servingParticipantId,
            },
        });

        // 6️⃣ Attach participants
        await tx.matchParticipant.createMany({
            data: participantIds.map((participantId, index) => ({
                matchId: match.id,
                participantId,
                position: index + 1, // 1 = P1 / Team A, 2 = P2 / Team B
            })),
        });

        // 7️⃣ Pre-create match parts
        await tx.matchPart.createMany({
            data: Array.from({ length: partsCount }).map((_, i) => ({
                matchId: match.id,
                partNumber: i + 1,
            })),
        });

        return match;
    });
};



export const createMatchesBulk = async ({ tournamentId, matches }) => {
    return prisma.$transaction(async (tx) => {
        const created = [];

        for (const match of matches) {
            const m = await tx.match.create({
                data: {
                    tournamentId,
                    round: match.round,
                    matchNumber: match.matchNumber,
                },
            });

            await tx.matchParticipant.createMany({
                data: match.participantIds.map((id, idx) => ({
                    matchId: m.id,
                    participantId: id,
                    position: idx + 1,
                })),
            });

            created.push(m);
        }

        return created;
    });
};


export const listMatchesByTournament = async (tournamentId) => {
    return prisma.match.findMany({
        where: { tournamentId },
        include: {
            participants: {
                include: {
                    participant: true,
                },
            },
        },
        orderBy: [
            { round: "asc" },
            { matchNumber: "asc" },
        ],
    });
};


export const endMatch = async (matchId) => {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { parts: true },
    });

    if (!match) throw new Error("MATCH_NOT_FOUND");
    if (match.status !== "LIVE") throw new Error("MATCH_NOT_LIVE");

    // winner should already be set by engine
    return prisma.match.update({
        where: { id: matchId },
        data: {
            status: "COMPLETED",
            endTime: new Date(),
        },
    });
};
