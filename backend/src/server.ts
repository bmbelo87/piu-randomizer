import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import championshipRoutes from "./routes/championshipRoutes";
import songRoutes from "./routes/songRoutes";
import phaseRoutes from "./routes/phaseRoutes";
import drawRoutes from "./routes/drawRoutes";
import displayRoutes from "./routes/displayRoutes";
import { adminAuth } from "./middleware/adminAuth";
import { seedIfEmpty } from "./database/seedIfEmpty";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(adminAuth);

app.use("/banners",
    express.static(
        path.join(
            process.cwd(),
            "uploads",
            "banners"
        )
    )
);

app.use("/previewsongs",
    express.static(
        path.join(
            process.cwd(),
            "uploads",
            "previewsongs"
        )
    )
);

app.use("/championships", championshipRoutes);
app.use("/songs", songRoutes);
app.use("/phases", phaseRoutes);
app.use("/draws", drawRoutes);
app.use("/display", displayRoutes);

app.get("/", (req, res) => {
    res.send("PIU Randomizer API");
});

const PORT = Number(process.env.PORT) || 3000;

seedIfEmpty()
    .catch(error => console.error("Nao foi possivel carregar o seed:", error))
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
