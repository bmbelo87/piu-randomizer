import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import { prisma } from "../src/database/prisma";

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

async function main() {
    const bannerDir = path.join(process.cwd(), "uploads", "banners");
    const files = fs.readdirSync(bannerDir).filter(f => f.toLowerCase().endsWith(".png"));

    const byKey = new Map<string, string[]>();
    for (const f of files) {
        const arr = byKey.get(normalize(path.parse(f).name)) ?? [];
        arr.push(f);
        byKey.set(normalize(path.parse(f).name), arr);
    }

    const songs = await prisma.song.findMany({
        select: { id: true, title: true, bannerPath: true }
    });

    let updated = 0;
    let stillMissing = 0;

    for (const song of songs) {
        const key = normalize(song.title);
        const files = byKey.get(key) ?? [];

        if (song.bannerPath !== "" && song.bannerPath !== null) {

            if (!fs.existsSync(path.join(bannerDir, song.bannerPath))) {
                // broken reference: fix if a file matching the title exists now
                const chosen = files[0];
                if (chosen) {
                    await prisma.song.update({ where: { id: song.id }, data: { bannerPath: chosen } });
                    console.log(`REPARADO: ${song.title} -> ${chosen}`);
                    updated++;
                } else {
                    console.log(`QUEBRADO (sem arquivo): ${song.title} -> ${song.bannerPath}`);
                }
            }
            continue;
        }

        const chosen = files[0];
        if (!chosen) {
            stillMissing++;
            console.log(`SEM: ${song.title}`);
            continue;
        }

        await prisma.song.update({ where: { id: song.id }, data: { bannerPath: chosen } });
        updated++;
        console.log(`OK: ${song.title} -> ${chosen}`);
    }

    console.log("");
    console.log(`Linkados/reparados: ${updated}, ainda sem banner: ${stillMissing}`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
