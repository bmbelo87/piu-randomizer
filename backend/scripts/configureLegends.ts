/**
 * Legends: so a categoria e ativada (sem ativar fase) e cada lista mostra o
 * proprio nivel. Uso (dentro de backend/):
 *   npx ts-node scripts/configureLegends.ts
 */
import "dotenv/config";
import { prisma } from "../src/database/prisma";

async function main() {
    const legends = await prisma.championship.findFirst({
        where: { name: "Legends" },
        include: { phases: { orderBy: { order: "asc" } } }
    });

    if (!legends) {
        throw new Error("Campeonato Legends nao encontrado");
    }

    await prisma.championship.update({
        where: { id: legends.id },
        data: { requiresActivation: true, phaseActivation: false }
    });

    for (const phase of legends.phases) {
        // cada lista se chama pelo proprio slot: S22, S23, S24, D25, D26, D27
        await prisma.phase.update({
            where: { id: phase.id },
            data: { description: phase.name }
        });
        console.log(`${phase.name}: ${phase.name}`);
    }

    console.log("Legends: ativacao so da categoria (requiresActivation=true, phaseActivation=false)");
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
