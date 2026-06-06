import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from "./routes/authRoutes";
import championshipRoutes from "./routes/championshipRoutes";
import songRoutes from "./routes/songRoutes";
import phaseRoutes from "./routes/phaseRoutes";
import drawRoutes from "./routes/drawRoutes";
import displayRoutes from "./routes/displayRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/auth", authRoutes);
app.use("/championships", championshipRoutes);
app.use("/songs", songRoutes);
app.use("/phases", phaseRoutes);
app.use("/draws", drawRoutes);
app.use("/display", displayRoutes);

app.get("/", (req, res) => {
    res.send("PIU Randomizer API");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

