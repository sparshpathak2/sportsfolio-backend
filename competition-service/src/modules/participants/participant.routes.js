import express from "express";
import {
    addParticipant,
    listParticipants,
    removeParticipant,
} from "./participant.controller.js";

const router = express.Router();

router.post("/", addParticipant);
router.get("/:tournamentId", listParticipants);
router.delete("/:id", removeParticipant);

export default router;
