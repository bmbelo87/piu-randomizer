/**
 * Define o texto exibido em cada fase do campeonato Master.
 *
 * Uso (dentro de backend/):
 *   npx ts-node scripts/setMasterDescriptions.ts
 */
import "dotenv/config";
import { prisma } from "../src/database/prisma";

const DESCRIPTIONS = ["S21 e S22", "S23 e D23", "S24 e D24", "D25 e D26"];

async function main() {
    const master = await prisma.championship.findFirst({
        where: { name: "Master" },
        include: { phases: { orderBy: { order: "asc" } } }
    });

    if (!master || master.phases.length !== DESCRIPTIONS.length) {
        throw new Error("Campeonato Master nao encontrado com 4 fases");
    }

    for (const [index, phase] of master.phases.entries()) {
        await prisma.phase.update({
            where: { id: phase.id },
            data: { description: DESCRIPTIONS[index] }
        });
        console.log(`${phase.name}: ${DESCRIPTIONS[index]}`);
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
