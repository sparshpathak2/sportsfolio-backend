import { ScoringEngine } from "../interfaces/ScoringEngine.js";

// export class BadmintonScoringEngine extends ScoringEngine {
//     /**
//      * Apply scoring event
//      */
//     applyEvent({ match, eventType, payload }) {
//         if (eventType !== "POINT") {
//             throw new Error("Unsupported event type for badminton");
//         }

//         const { participantId, position } = payload;

//         if (![1, 2].includes(position)) {
//             throw new Error("Invalid participant position");
//         }

//         const currentPart = match.parts[match.parts.length - 1];

//         if (!currentPart) {
//             throw new Error("No active match part found");
//         }

//         // Update score
//         if (position === 1) currentPart.p1Score += 1;
//         if (position === 2) currentPart.p2Score += 1;

//         // Win condition: 21 points with 2-point lead
//         const diff = Math.abs(currentPart.p1Score - currentPart.p2Score);
//         const maxScore = Math.max(currentPart.p1Score, currentPart.p2Score);

//         if (maxScore >= 21 && diff >= 2) {
//             currentPart.winnerParticipantId = participantId;
//         }

//         return {
//             currentPart,
//             matchCompleted: Boolean(currentPart.winnerParticipantId),
//         };
//     }

//     /**
//      * Persist part updates
//      */
//     async persist(prisma, state) {
//         const { currentPart } = state;

//         await prisma.matchPart.update({
//             where: { id: currentPart.id },
//             data: {
//                 p1Score: currentPart.p1Score,
//                 p2Score: currentPart.p2Score,
//                 winnerParticipantId: currentPart.winnerParticipantId,
//             },
//         });
//     }
// }



export class BadmintonScoringEngine extends ScoringEngine {
    applyEvent({ match, eventType, payload }) {
        const currentPart = match.parts.find(p => !p.winnerParticipantId);
        if (!currentPart) throw new Error("NO_ACTIVE_PART");

        const { participantId, position } = payload;

        if (position === 1) currentPart.p1Score++;
        if (position === 2) currentPart.p2Score++;

        const diff = Math.abs(currentPart.p1Score - currentPart.p2Score);
        const maxScore = Math.max(currentPart.p1Score, currentPart.p2Score);

        if (maxScore >= 21 && diff >= 2) {
            currentPart.winnerParticipantId = participantId;
        }

        return { currentPart };
    }

    async persist(prisma, state) {
        await prisma.matchPart.update({
            where: { id: state.currentPart.id },
            data: {
                p1Score: state.currentPart.p1Score,
                p2Score: state.currentPart.p2Score,
                winnerParticipantId: state.currentPart.winnerParticipantId,
            },
        });
    }
}

