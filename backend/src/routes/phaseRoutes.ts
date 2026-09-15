import { Router } from "express";

import { addChartToPhase, clearDrawHistory, getPhase, removeChartFromPhase } from "../controllers/phaseController";

const router = Router();

router.post(
    "/:id/charts",
    addChartToPhase
);

router.get(
    "/:id",
    getPhase
);

router.delete(
    "/charts/:phaseChartId",
    removeChartFromPhase
);

router.delete(
    "/:phaseId/history",
    clearDrawHistory
)

export default router;