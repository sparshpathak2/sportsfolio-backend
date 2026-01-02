import * as tournamentService from "./tournament.service.js";

export const createTournament = async (req, res) => {
    try {
        const {
            name,
            sportCode,
            tournamentType,
            startDate,
            endDate,
            locationId,
            scheduleType,
            isPublic,
            entryFee,
            rules,
        } = req.body;

        if (!name || !sportCode || !tournamentType || !startDate || !locationId) {
            return res.status(400).json({
                success: false,
                message:
                    "name, sportCode, tournamentType, startDate, locationId are required",
            });
        }

        const tournament = await tournamentService.createTournament({
            name,
            sportCode,
            tournamentType,
            startDate,
            endDate,
            locationId,
            scheduleType,
            isPublic,
            entryFee,
            rules,
        });

        res.status(201).json({
            success: true,
            message: "Tournament created successfully",
            data: tournament,
        });
    } catch (error) {
        console.error("Create Tournament Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const listTournaments = async (req, res) => {
    // console.log("req.header at listTournaments:", req.headers)
    try {
        const tournaments = await tournamentService.listTournaments();
        res.json({ success: true, data: tournaments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTournament = async (req, res) => {
    try {
        const tournament = await tournamentService.getTournament(req.params.id);

        res.json({
            success: true,
            message: "Tournament fetched successfully",
            data: tournament,
        });
    } catch (error) {
        const map = {
            TOURNAMENT_NOT_FOUND: [404, "Tournament not found"],
        };

        const [status, message] = map[error.message] || [
            500,
            "Failed to fetch tournament",
        ];

        res.status(status).json({
            success: false,
            message,
        });
    }
};


export const updateTournament = async (req, res) => {
    try {
        const updated = await tournamentService.updateTournament(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Tournament updated successfully",
            data: updated,
        });
    } catch (error) {
        const map = {
            TOURNAMENT_NOT_FOUND: [404, "Tournament not found"],
            TOURNAMENT_LOCKED: [409, "Tournament can no longer be modified"],
            INVALID_DATE_RANGE: [400, "Invalid date range"],
        };

        const [status, message] = map[error.message] || [
            400,
            "Failed to update tournament",
        ];

        res.status(status).json({ success: false, message });
    }
};


export const deleteTournament = async (req, res) => {
    try {
        await tournamentService.deleteTournament(req.params.id);

        res.json({
            success: true,
            message: "Tournament deleted successfully",
        });
    } catch (error) {
        const map = {
            TOURNAMENT_NOT_FOUND: [404, "Tournament not found"],
            TOURNAMENT_CANNOT_BE_DELETED: [
                409,
                "Only draft tournaments can be deleted",
            ],
        };

        const [status, message] = map[error.message] || [
            400,
            "Failed to delete tournament",
        ];

        res.status(status).json({
            success: false,
            message,
        });
    }
};


/**
 * Tournament Rules (Upsert)
 */
export const upsertTournamentRules = async (req, res) => {
    try {
        const rules = await tournamentService.upsertTournamentRules(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Tournament rules saved successfully",
            data: rules,
        });
    } catch (error) {
        const map = {
            TOURNAMENT_NOT_FOUND: [404, "Tournament not found"],
        };

        const [status, message] = map[error.message] || [
            400,
            "Failed to save tournament rules",
        ];

        res.status(status).json({
            success: false,
            message,
        });
    }
};

