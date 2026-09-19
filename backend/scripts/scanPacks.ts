import fs from "fs";
import path from "path";
import { prisma } from "../src/database/prisma";

const PACKS_DIR = "/home/silver/Downloads/Songs";
const PACKS = [
    "07.NX~NXA",
    "08.FIESTA",
    "09.FIESTA EX",
    "10.FIESTA 2",
    "11.PRIME",
    "12.PRIME 2"
];

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function findMainSsc(songDir: string): string | null {
    const base = path.basename(songDir);
    const direct = path.join(songDir, `${base}.ssc`);
    if (fs.existsSync(direct)) return direct;

    const candidates = fs
        .readdirSync(songDir, { withFileTypes: true })
        .filter(e =>
            e.isFile() &&
            e.name.toLowerCase().endsWith(".ssc") &&
            !e.name.toLowerCase().endsWith(".ext")
        )
        .map(e => path.join(songDir, e.name));

    if (candidates.length === 1) return candidates[0];
    const withSample = candidates.find(c =>
        fs.readFileSync(c, "utf8").includes("SAMPLESTART:")
    );
    return withSample ?? candidates[0] ?? null;
}

async function main() {
    const songs = await prisma.song.findMany({
        select: { id: true, title: true, previewPath: true }
    });
    const missing = songs
        .filter(s => !s.previewPath)
        .map(s => ({ ...s, key: normalize(s.title) }));
    const missingByKey = new Map(missing.map(s => [s.key, s]));

    console.log(`Faltando preview: ${missing.length}\n`);

    const found: Record<string, string[]> = {};

    for (const pack of PACKS) {
        const packDir = path.join(PACKS_DIR, pack);
        if (!fs.existsSync(packDir)) continue;

        const entries = fs
            .readdirSync(packDir, { withFileTypes: true })
            .filter(e => e.isDirectory() && !/^backup$/i.test(e.name));

        for (const e of entries) {
            const sscFile = findMainSsc(path.join(packDir, e.name));
            if (!sscFile) continue;
            const content = fs.readFileSync(sscFile, "utf8");
            const titleMatch = content.match(/^#TITLE:(.*);/m);
            if (!titleMatch) continue;
            const title = titleMatch[1].trim();
            const key = normalize(title);
            const song = missingByKey.get(key);
            if (song) {
                (found[song.title] ??= []).push(`${pack}/${e.name} (ssc: ${title})`);
            }
        }
    }

    if (Object.keys(found).length === 0) {
        console.log("Nenhuma música faltante encontrada nesses packs.");
    } else {
        for (const [title, packs] of Object.entries(found).sort()) {
            const pre = missing.find(s => s.title === title);
            const id = pre?.id ?? "";
            console.log(`${id} | ${title}`);
            for (const p of packs) console.log(`      -> ${p}`);
        }
    }

    console.log(`\nTotal encontrado: ${Object.keys(found).length} de ${missing.length}`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});