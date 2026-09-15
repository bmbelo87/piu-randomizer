import { Router } from "express";

import { getDisplay, getConsolidatedPool } from "../controllers/displayController";

const router = Router();

router.get(
    "/",
    getDisplay
);

router.get(
    "/pool",
    getConsolidatedPool
);

export default router;