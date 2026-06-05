import { Router } from "express";

import { createChampionship, getChampionship, listChampionships, setCurrentPhase } from "../controllers/championshipController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createChampionship
);

router.get(
    "/",
    authMiddleware,
    listChampionships
);

router.get(
    "/:id",
    authMiddleware,
    getChampionship
);

router.patch(
    "/:id/current-phase",
    authMiddleware,
    setCurrentPhase
);

export default router;