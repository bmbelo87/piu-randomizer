import { Router } from "express";

import {
    createSong,
    listSongs,
    listCharts,
    getBannerPool
} from "../controllers/songController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createSong
);

router.get(
    "/",
    authMiddleware,
    listSongs
);

router.get(
    "/charts",
    authMiddleware,
    listCharts
);

router.get(
    "/banner-pool",
    getBannerPool
);

export default router;