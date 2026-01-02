import * as participantService from "./participant.service.js";

export const joinTournamentWithCode = async (req, res) => {
    try {
        const { joinCode, tournamentId } = req.params;
        const { playerId, teamId } = req.body;

        if (!playerId && !teamId) {
            throw new Error("playerId or teamId is required");
        }

        const participant =
            await participantService.joinTournamentByCode({
                tournamentId,
                joinCode,
                playerId,
                teamId,
            });

        res.status(201).json({
            success: true,
            data: participant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// export const joinTournamentDirect = async (req, res) => {
//     try {
//         const { tournamentId } = req.params;
//         const playerId = req.user?.id;

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "AUTH_REQUIRED",
//             });
//         }

//         const participant = await participantService.joinTournament({
//             tournamentId,
//             userId,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Joined tournament successfully",
//             data: participant,
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

export const joinTournamentDirect = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const playerId = req.user?.id; // or however you map user → player

        const participant = await participantService.joinTournament({
            tournamentId,
            playerId,
        });

        res.status(201).json({
            success: true,
            message: "Joined tournament successfully",
            data: participant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


