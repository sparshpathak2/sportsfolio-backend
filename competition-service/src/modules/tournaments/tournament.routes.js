import express from "express";
import * as tournamentController from "./tournament.controller.js";
import participantRoutes from "./participant.routes.js";
import matchRoutes from "../matches/match.routes.js";

const router = express.Router();

/* =====================
   TOURNAMENT CRUD
   ===================== */
router.post("/", tournamentController.createTournament);
router.get("/", tournamentController.listTournaments);
router.get("/:id", tournamentController.getTournament);
router.put("/:id", tournamentController.updateTournament);
router.delete("/:id", tournamentController.deleteTournament);

/* =====================
   TOURNAMENT RULES
   ===================== */
router.post("/:id/rules", tournamentController.upsertTournamentRules);

/* =====================
   PARTICIPANTS (nested)
   ===================== */
router.use("/:tournamentId/participants", participantRoutes);

/* =====================
   MATCH CREATION (nested)
   ===================== */
router.use("/:tournamentId/matches", matchRoutes);

export default router;
