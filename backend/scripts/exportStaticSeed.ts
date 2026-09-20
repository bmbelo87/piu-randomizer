/**
 * Exporta o SQLite atual para frontend/src/static/seed.json, usado como dado
 * inicial do modo estatico (GitHub Pages). Sorteios e fase ativa nao sao
 * exportados: o modo estatico sempre comeca "limpo".
 *
 * Uso (dentro de backend/):
 *   npm run export-static-seed
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/database/prisma";

async function main() {
    const seed = {
        championships: (await prisma.championship.findMany()).map(c => ({
            ...c,
            currentPhaseId: null
        })),
        phases: await prisma.phase.findMany(),
        songs: await prisma.song.findMany(),
        charts: await prisma.chart.findMany(),
        phaseCharts: await prisma.phaseChart.findMany(),
        draws: []
    };

    const target = path.resolve(__dirname, "../../frontend/src/static/seed.json");
    fs.writeFileSync(target, JSON.stringify(seed));

    console.log(
        `Seed gravado em ${target}:`,
        Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length]))
    );
}

main()
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
