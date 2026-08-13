import { Router } from "express";
import { getState, listStates } from "../controllers/states.controller";

const router = Router();
router.get("/", listStates);
router.get("/:id", getState);

export default router;
