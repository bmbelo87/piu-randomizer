import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import { prisma } from "../src/database/prisma";

const SRC = "/home/silver/Downloads/15.PHOENIX 2";

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

async function main() {
    const songs = await prisma.song.findMany({
        where: { bannerPath: "" },
        select: { id: true, title: true }
    });

    const candidates: { key: string; file: string }[] = [];

    for (const entry of fs.readdirSync(SRC, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        for (const file of fs.readdirSync(path.join(SRC, entry.name))) {
            if (!file.toLowerCase().endsWith(".png")) continue;

            candidates.push({
                key: normalize(path.parse(file).name),
                file
            });
        }
    }

    const byKey = new Map<string, string[]>();

    for (const c of candidates) {
        const arr = byKey.get(c.key) ?? [];
        arr.push(c.file);
        byKey.set(c.key, arr);
    }

    const destDir = path.join(process.cwd(), "uploads", "banners");

    let copied = 0;
    let missing = 0;

    for (const song of songs) {
        const files = byKey.get(normalize(song.title)) ?? [];

        const chosen =
            files.find(f => !/_b\.png$/i.test(f)) ??
            files[0];

        if (!chosen) {
            missing++;
            console.log(`SEM: ${song.title}`);
            continue;
        }

        let srcFile: string | null = null;

        for (const entry of fs.readdirSync(SRC, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;

            const p = path.join(SRC, entry.name, chosen);

            if (fs.existsSync(p)) {
                srcFile = p;
                break;
            }
        }

        if (!srcFile) {
            missing++;
            console.log(`SEM (origem nao achada): ${song.title}`);
            continue;
        }

        fs.copyFileSync(srcFile, path.join(destDir, chosen));

        await prisma.song.update({
            where: { id: song.id },
            data: { bannerPath: chosen }
        });

        copied++;
        console.log(`OK: ${song.title} -> ${chosen}`);
    }

    console.log("");
    console.log(`Copiados: ${copied}, sem banner: ${missing}`);

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});