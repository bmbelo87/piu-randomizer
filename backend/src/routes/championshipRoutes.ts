import { Router } from "express";

import { clearDisplay, createChampionship, deleteChampionship, getChampionship, listChampionships, setCurrentPhase } from "../controllers/championshipController";

const router = Router();

router.post(
    "/",
    createChampionship
);

router.get(
    "/",
    listChampionships
);

router.get(
    "/:id",
    getChampionship
);

router.delete(
    "/:id",
    deleteChampionship
);

router.patch(
    "/:id/current-phase",
    setCurrentPhase
);

router.post(
    "/:id/clear-display",
    clearDisplay
);

export default router;