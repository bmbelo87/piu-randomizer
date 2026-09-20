/**
 * Exporta o SQLite atual para frontend/src/static/seed.json (dado inicial do
 * modo estatico/GitHub Pages) e backend/data/seed.json (banco inicial na
 * hospedagem). Sorteios e fase ativa nao sao exportados: sempre comeca "limpo".
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

    // frontend: dado inicial do modo Pages; backend: banco inicial em hospedagem de disco efemero
    const targets = [
        path.resolve(__dirname, "../../frontend/src/static/seed.json"),
        path.resolve(__dirname, "../data/seed.json")
    ];

    for (const target of targets) {
        fs.writeFileSync(target, JSON.stringify(seed));
    }

    console.log(
        `Seed gravado em:\n  ${targets.join("\n  ")}\n`,
        Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length]))
    );
}

main()
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
