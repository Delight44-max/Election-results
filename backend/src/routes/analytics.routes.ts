import { Router } from "express";
import {
  getCoverage,
  getLgaAnalytics,
  getOverview,
  getPartyAnalytics,
  getTopPollingUnits,
} from "../controllers/analytics.controller";

const router = Router();
router.get("/overview", getOverview);
router.get("/parties", getPartyAnalytics);
router.get("/lgas", getLgaAnalytics);
router.get("/coverage", getCoverage);
router.get("/top-polling-units", getTopPollingUnits);

export default router;
