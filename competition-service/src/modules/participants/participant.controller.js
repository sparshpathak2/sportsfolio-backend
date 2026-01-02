import * as participantService from "./participant.service.js";

/**
 * Add participant
 */
export const addParticipant = async (req, res) => {
    try {
        const {
            tournamentId,
            participantType,
            playerId,
            teamId,
            seed,
        } = req.body;

        console.log("payload at addParticipant:", req.body);

        if (!tournamentId || !participantType) {
            return res.status(400).json({
                success: false,
                message: "tournamentId and participantType are required",
            });
        }

        const participant = await participantService.addParticipant({
            tournamentId,
            participantType,
            playerId,
            teamId,
            seed,
        });

        return res.status(201).json({
            success: true,
            message: "Participant added successfully",
            data: participant,
        });
    } catch (error) {
        console.error("Add Participant Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to add participant",
        });
    }
};

/**
 * List participants
 */
export const listParticipants = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        const participants = await participantService.listParticipants(
            tournamentId
        );

        return res.json({
            success: true,
            message: "Participants fetched successfully",
            data: participants,
        });
    } catch (error) {
        console.error("List Participants Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch participants",
        });
    }
};

/**
 * Remove participant
 */
export const removeParticipant = async (req, res) => {
    try {
        const { id } = req.params;

        await participantService.removeParticipant(id);

        return res.json({
            success: true,
            message: "Participant removed successfully",
        });
    } catch (error) {
        console.error("Remove Participant Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to remove participant",
        });
    }
};
