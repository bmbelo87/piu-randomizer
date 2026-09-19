import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import { prisma } from "../src/database/prisma";

const PREVIEWS_DIR = path.join(process.cwd(), "uploads", "previewsongs");

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

async function main() {
    const songs = await prisma.song.findMany({
        select: { title: true, previewPath: true }
    });

    const keepKeys = new Set<string>(songs.map(s => normalize(s.title)));
    const keepFiles = new Set<string>(
        songs
            .map(s => s.previewPath)
            .filter((p): p is string => Boolean(p))
    );

    const files = fs
        .readdirSync(PREVIEWS_DIR)
        .filter(f => f.toLowerCase().endsWith(".mp3"));

    let kept = 0;
    let removed = 0;

    for (const file of files) {
        const key = normalize(path.parse(file).name);
        if (keepKeys.has(key) || keepFiles.has(file)) {
            kept++;
            continue;
        }

        fs.unlinkSync(path.join(PREVIEWS_DIR, file));
        removed++;
        console.log(`REMOVIDO: ${file}`);
    }

    const remaining = fs
        .readdirSync(PREVIEWS_DIR)
        .filter(f => f.toLowerCase().endsWith(".mp3"));

    const byKey = new Map<string, string>();
    for (const f of remaining) {
        byKey.set(normalize(path.parse(f).name), f);
    }

    let linked = 0;
    let noPreview = 0;
    for (const song of songs) {
        const hasFile =
            (song.previewPath &&
                remaining.includes(song.previewPath)) ||
            byKey.has(normalize(song.title));
        if (hasFile) {
            linked++;
        } else {
            noPreview++;
        }
    }

    console.log(
        `\nArquivos mantidos (músicas do campeonato): ${remaining.length}, removidos: ${removed}`
    );
    console.log(`DB: com preview ${linked}, sem preview ${noPreview}`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});