import express from "express";
import { joinTournamentDirect, joinTournamentWithCode } from "./participant.controller.js";

const router = express.Router({ mergeParams: true });

// Join via public code
router.post("/join/:joinCode", joinTournamentWithCode);

// Join via logged-in button click
router.post("/join/", joinTournamentDirect);

export default router;
