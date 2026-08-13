import { Router } from "express";
import { getResultsSummary, listResults } from "../controllers/results.controller";

const router = Router();
// summary must be registered before the generic root to avoid any ambiguity in tooling
router.get("/summary", getResultsSummary);
router.get("/", listResults);

export default router;
