import { Router } from "express";
import { getWard, listWards } from "../controllers/wards.controller";

const router = Router();
router.get("/", listWards);
router.get("/:id", getWard);

export default router;
