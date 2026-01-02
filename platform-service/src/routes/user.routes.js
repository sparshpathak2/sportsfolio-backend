import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.post("/", userController.createUser);
router.get("/", userController.listUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

export default router;
