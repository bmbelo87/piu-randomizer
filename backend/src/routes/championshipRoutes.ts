import { Router } from "express";

import { createChampionship, deleteChampionship, getChampionship, listChampionships, setCurrentPhase } from "../controllers/championshipController";

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

export default router;