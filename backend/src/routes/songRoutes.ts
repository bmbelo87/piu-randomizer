import { Router } from "express";

import {
    createSong,
    listSongs,
    listCharts,
    getBannerPool
} from "../controllers/songController";

const router = Router();

router.post(
    "/",
    createSong
);

router.get(
    "/",
    listSongs
);

router.get(
    "/charts",
    listCharts
);

router.get(
    "/banner-pool",
    getBannerPool
);

export default router;