import { Router } from "express";

import {
    drawCharts 
} from "../controllers/drawController";

const router = Router();

router.post(
    "/phase/:id",
    drawCharts
);

export default router;