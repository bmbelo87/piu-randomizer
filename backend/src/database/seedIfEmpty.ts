import fs from "fs";
import path from "path";

import { prisma } from "./prisma";

const SEED_FILE = path.resolve(__dirname, "../../data/seed.json");

const CHUNK = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insert(rows: any[], create: (data: any[]) => Promise<unknown>) {
    for (let i = 0; i < rows.length; i += CHUNK) {
        await create(rows.slice(i, i + CHUNK));
    }
}

/**
 * Em hospedagens com disco efemero (ex.: Render gratis) o SQLite volta vazio a
 * cada reinicio. Carrega backend/data/seed.json quando nao ha nada no banco.
 * Gerado por `npm run export-static-seed`.
 */
export async function seedIfEmpty() {
    const [championships, songs] = await Promise.all([
        prisma.championship.count(),
        prisma.song.count()
    ]);

    if (championships > 0 || songs > 0 || !fs.existsSync(SEED_FILE)) {
        return;
    }

    const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));

    await insert(seed.championships, data => prisma.championship.createMany({ data }));
    await insert(seed.songs, data => prisma.song.createMany({ data }));
    await insert(seed.phases, data => prisma.phase.createMany({ data }));
    await insert(seed.charts, data => prisma.chart.createMany({ data }));
    await insert(seed.phaseCharts, data => prisma.phaseChart.createMany({ data }));

    console.log(
        `Banco vazio: carregado o seed (${seed.championships.length} campeonatos, ${seed.songs.length} musicas).`
    );
}
