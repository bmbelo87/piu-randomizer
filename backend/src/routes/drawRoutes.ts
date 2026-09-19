import { Router } from "express";

import {
    drawCharts,
    rerollChart
} from "../controllers/drawController";

const router = Router();

router.post(
    "/phase/:id",
    drawCharts
);

router.post(
    "/phase/:id/reroll",
    rerollChart
);

export default router;
