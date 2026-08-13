import { Router } from "express";
import { getPartyResults, listParties } from "../controllers/parties.controller";

const router = Router();
router.get("/", listParties);
router.get("/:party/results", getPartyResults);

export default router;
