// import { Router } from "express";
// import * as matchController from "./match.controller.js";

// const router = Router({ mergeParams: true });

// /* =====================
//    MATCH CREATION
//    ===================== */
// router.post("/", matchController.createMatch);
// router.post("/bulk", matchController.createMatchesBulk);
// router.get("/", matchController.listMatchesByTournament);

// /* =====================
//    MATCH LIFECYCLE
//    ===================== */
// router.post("/:id/start", matchController.startMatch);
// router.post("/:id/events", matchController.recordMatchEvent);
// router.get("/:id/live", matchController.getLiveMatchState);
// router.post("/:id/end", matchController.endMatch);

// export default router;


import { Router } from "express";
import * as matchController from "./match.controller.js";

const router = Router({ mergeParams: true });

/* =====================
   MATCH LISTING
   ===================== */

// GET /matches
// GET /tournaments/:tournamentId/matches
router.get("/", matchController.listMatches);

/* =====================
   MATCH CREATE
   ===================== */

// POST /matches
// POST /tournaments/:tournamentId/matches
router.post("/", matchController.createMatch);

/* =====================
   MATCH READ
   ===================== */

// GET /matches/:id
// GET /tournaments/:tournamentId/matches/:id
router.get("/:id", matchController.getMatchById);

/* =====================
   MATCH LIFECYCLE
   ===================== */

// POST /matches/:id/start
router.post("/:id/start", matchController.startMatch);

// POST /matches/:id/events
router.post("/:id/events", matchController.recordMatchEvent);

// GET /matches/:id/live
router.get("/:id/live", matchController.getLiveMatchState);

// POST /matches/:id/end
router.post("/:id/end", matchController.endMatch);

export default router;

