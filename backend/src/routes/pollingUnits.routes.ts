import { Router } from "express";
import {
  getPollingUnit,
  getPollingUnitResults,
  listPollingUnits,
} from "../controllers/pollingUnits.controller";

const router = Router();
router.get("/", listPollingUnits);
router.get("/:id", getPollingUnit);
router.get("/:id/results", getPollingUnitResults);

export default router;
