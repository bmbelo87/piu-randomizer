import { Router } from "express";

import { addChartToPhase, clearDrawHistory, getPhase, removeChartFromPhase } from "../controllers/phaseController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/:id/charts",
    authMiddleware,
    addChartToPhase
);

router.get(
    "/:id",
    authMiddleware,
    getPhase
);

router.delete(
    "/charts/:phaseChartId",
    authMiddleware,
    removeChartFromPhase
);

router.delete(
    "/:phaseId/history",
    authMiddleware,
    clearDrawHistory
)

export default router;