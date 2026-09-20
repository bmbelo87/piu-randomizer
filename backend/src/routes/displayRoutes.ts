import { Router } from "express";

import { getDisplay, getConsolidatedPool } from "../controllers/displayController";
import { publishDisplayEvent, streamDisplayEvents } from "../controllers/displayEventsController";

const router = Router();

router.get(
    "/",
    getDisplay
);

router.get(
    "/pool",
    getConsolidatedPool
);

router.get(
    "/events",
    streamDisplayEvents
);

router.post(
    "/events",
    publishDisplayEvent
);

export default router;