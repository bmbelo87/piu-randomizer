/**
 * Copia todos os dados do banco PostgreSQL antigo para o SQLite atual.
 *
 * Uso (dentro de backend/):
 *   npx prisma db push
 *   npm run copy-from-postgres
 *
 * A URL do Postgres vem de PG_URL (no .env ou na linha de comando).
 *
 * O SQLite de destino e o do DATABASE_URL no .env (file:./dev.db).
 * As tabelas do SQLite sao limpas antes da copia.
 */
import "dotenv/config";
import { Client } from "pg";
import { prisma } from "../src/database/prisma";

const CHUNK = 500;

async function readAll(pg: Client, table: string) {
    const { rows } = await pg.query(`SELECT * FROM "${table}"`);
    return rows;
}

async function insertChunks<T>(
    label: string,
    rows: T[],
    insert: (data: T[]) => Promise<unknown>
) {
    for (let i = 0; i < rows.length; i += CHUNK) {
        await insert(rows.slice(i, i + CHUNK));
    }
    console.log(`  ${label}: ${rows.length}`);
}

async function main() {
    const pgUrl = process.env.PG_URL;

    if (!pgUrl) {
        console.error(
            'Defina PG_URL, ex.: PG_URL="postgresql://usuario:senha@localhost:5432/piu_randomizer"'
        );
        process.exit(1);
    }

    const pg = new Client({ connectionString: pgUrl });
    await pg.connect();

    console.log("Lendo PostgreSQL...");
    const championships = await readAll(pg, "Championship");
    const songs = await readAll(pg, "Song");
    const phases = await readAll(pg, "Phase");
    const charts = await readAll(pg, "Chart");
    const phaseCharts = await readAll(pg, "PhaseChart");
    const draws = await readAll(pg, "Draw");
    await pg.end();

    console.log("Limpando SQLite...");
    await prisma.$transaction([
        prisma.draw.deleteMany(),
        prisma.phaseChart.deleteMany(),
        prisma.phase.deleteMany(),
        prisma.chart.deleteMany(),
        prisma.song.deleteMany(),
        prisma.championship.deleteMany()
    ]);

    console.log("Gravando SQLite...");
    await insertChunks("Championship", championships, (data) =>
        prisma.championship.createMany({ data })
    );
    await insertChunks("Song", songs, (data) =>
        prisma.song.createMany({ data })
    );
    await insertChunks("Phase", phases, (data) =>
        prisma.phase.createMany({ data })
    );
    await insertChunks("Chart", charts, (data) =>
        prisma.chart.createMany({ data })
    );
    await insertChunks("PhaseChart", phaseCharts, (data) =>
        prisma.phaseChart.createMany({ data })
    );
    await insertChunks("Draw", draws, (data) =>
        prisma.draw.createMany({ data })
    );

    console.log("Pronto!");
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
