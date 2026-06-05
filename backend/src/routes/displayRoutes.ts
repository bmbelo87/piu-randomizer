import { Router } from "express";

import { getDisplay } from "../controllers/displayController";

const router = Router();

router.get(
    "/",
    getDisplay
);

export default router;