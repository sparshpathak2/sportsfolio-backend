import * as matchService from "./match.service.js";
import prisma from "../../lib/prisma.js";

export const startMatch = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await matchService.startMatch(id);

        return res.json({
            success: true,
            message: "Match started",
            data: match,
        });
    } catch (error) {
        console.error("Start Match Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


export const recordMatchEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, payload } = req.body;

        const result = await matchService.recordEvent({
            matchId: id,
            type,
            payload,
        });

        return res.json({
            success: true,
            message: "Event recorded",
            data: result,
        });
    } catch (error) {
        console.error("Record Event Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


export const getLiveMatchState = async (req, res) => {
    try {
        const { id } = req.params;

        const state = await matchService.getLiveState(id);

        return res.json({
            success: true,
            data: state,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


export const endMatch = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await matchService.endMatch(id);

        return res.json({
            success: true,
            message: "Match completed",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// export const createMatch = async (req, res) => {
//     try {
//         const { tournamentId } = req.params;
//         const { round, matchNumber, participantIds } = req.body;

//         const match = await matchService.createMatch({
//             tournamentId,
//             round,
//             matchNumber,
//             participantIds,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Match created",
//             data: match,
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

export const createMatch = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        const {
            locationId,
            playArea,
            gameType,
            partsCount,
            startTime,
            officialUserId,
            participantIds,
            servingParticipantId,
            round,
            matchNumber,
        } = req.body;

        // 1️⃣ Controller-level sanity checks
        if (!participantIds || !Array.isArray(participantIds)) {
            throw new Error("PARTICIPANTS_REQUIRED");
        }

        if (!gameType) {
            throw new Error("GAME_TYPE_REQUIRED");
        }

        // 2️⃣ Call service
        const match = await matchService.createMatch({
            tournamentId,
            locationId,
            playArea,
            gameType,
            partsCount,
            startTime: startTime ? new Date(startTime) : null,
            officialUserId,
            participantIds,
            servingParticipantId,
            round,
            matchNumber,
        });

        res.status(201).json({
            success: true,
            message: "Match created",
            data: match,
        });
    } catch (error) {
        console.error("Create Match Error:", error);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


export const createMatchesBulk = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { matches } = req.body;

        const result = await matchService.createMatchesBulk({
            tournamentId,
            matches,
        });

        res.status(201).json({
            success: true,
            message: "Matches created",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const listMatchesByTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        const matches = await matchService.listMatchesByTournament(tournamentId);

        res.json({
            success: true,
            data: matches,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMatchById = async (req, res) => {
    const { id } = req.params;
    const { tournamentId } = req.params;

    const match = await prisma.match.findFirst({
        where: {
            id,
            ...(tournamentId ? { tournamentId } : {})
        },
        include: {
            participants: true,
            location: true
        }
    });

    if (!match) {
        return res.status(404).json({ error: "MATCH_NOT_FOUND" });
    }

    res.json({
        success: true,
        data: match,
    });
};

export const listMatches = async (req, res) => {
    const { tournamentId } = req.params;

    const where = tournamentId
        ? { tournamentId }
        : {};

    const matches = await prisma.match.findMany({
        where,
        orderBy: { startTime: "desc" },
    });

    res.json({
        success: true,
        data: matches,
    });
};

