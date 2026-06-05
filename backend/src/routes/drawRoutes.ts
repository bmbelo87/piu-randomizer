import { Router } from "express";

import {
    drawCharts 
} from "../controllers/drawController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/phase/:id",
    authMiddleware,
    drawCharts
);

export default router;