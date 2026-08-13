import { Router } from "express";
import health from "./health.routes";
import states from "./states.routes";
import lgas from "./lgas.routes";
import wards from "./wards.routes";
import pollingUnits from "./pollingUnits.routes";
import results from "./results.routes";
import parties from "./parties.routes";
import agents from "./agents.routes";
import analytics from "./analytics.routes";
import search from "./search.routes";

const router = Router();

router.use("/health", health);
router.use("/states", states);
router.use("/lgas", lgas);
router.use("/wards", wards);
router.use("/polling-units", pollingUnits);
router.use("/results", results);
router.use("/parties", parties);
router.use("/agents", agents);
router.use("/analytics", analytics);
router.use("/search", search);

export default router;
