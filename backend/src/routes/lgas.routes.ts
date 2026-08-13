import { Router } from "express";
import { getLga, getLgaResults, listLgas } from "../controllers/lgas.controller";

const router = Router();
router.get("/", listLgas);
router.get("/:id", getLga);
router.get("/:id/results", getLgaResults);

export default router;
