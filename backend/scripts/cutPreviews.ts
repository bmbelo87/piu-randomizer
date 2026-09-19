import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { prisma } from "../src/database/prisma";

const execFileAsync = promisify(execFile);

const PACKS_DIR_SCAN = process.env.PACKS_DIR ?? "/home/silver/Downloads";
    const PACK_LIST = [
        path.join(PACKS_DIR_SCAN, "13.XX"),
        path.join(PACKS_DIR_SCAN, "14.PHOENIX"),
        path.join(PACKS_DIR_SCAN, "15.PHOENIX 2"),
        path.join(PACKS_DIR_SCAN, "16.RISE"),
        path.join(PACKS_DIR_SCAN, "22-PHOENIX 2"),
        path.join(PACKS_DIR_SCAN, "Songs", "04.1ST~PERFECT"),
        path.join(PACKS_DIR_SCAN, "Songs", "05.EXTRA~PREX 3"),
        path.join(PACKS_DIR_SCAN, "Songs", "06.EXCEED~ZERO"),
        path.join(PACKS_DIR_SCAN, "Songs", "07.NX~NXA"),
        path.join(PACKS_DIR_SCAN, "Songs", "08.FIESTA"),
        path.join(PACKS_DIR_SCAN, "Songs", "09.FIESTA EX"),
        path.join(PACKS_DIR_SCAN, "Songs", "10.FIESTA 2"),
        path.join(PACKS_DIR_SCAN, "Songs", "11.PRIME"),
        path.join(PACKS_DIR_SCAN, "Songs", "12.PRIME 2")
    ];

const PACK_NAMES = (process.env.PACK_NAMES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

const TARGET_TITLES = (process.env.TARGET_TITLES ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

const PACKS = PACK_NAMES.length === 0
    ? PACK_LIST
    : PACK_LIST.filter(p => PACK_NAMES.includes(path.basename(p)));

const OUT_DIR = path.join(process.cwd(), "uploads", "previewsongs");

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function sanitizeFilename(name: string) {
    return name.replace(/[\/\\:*?"<>|]/g, "_").trim();
}

async function resolveMusicFile(
    songDir: string,
    music: string
): Promise<string | null> {
    const direct = path.join(songDir, music);
    if (fs.existsSync(direct)) return direct;

    const needle = path.basename(music).toLowerCase();
    const found = fs
        .readdirSync(songDir, { withFileTypes: true })
        .find(e =>
            e.isFile() &&
            e.name.toLowerCase() === needle
        );

    return found
        ? path.join(songDir, found.name)
        : null;
}

interface SscInfo {
    title: string;
    music: string;
    preview: string | null;
    sampleStart: number | null;
    sampleLength: number | null;
    sscFile: string;
}

const TAG_MAP: Record<string, keyof SscInfo> = {
    TITLE: "title",
    MUSIC: "music",
    PREVIEW: "preview",
    SAMPLESTART: "sampleStart",
    SAMPLELENGTH: "sampleLength"
};

function parseSsc(filePath: string): SscInfo | null {
    const content = fs.readFileSync(filePath, "utf8");
    const found: Partial<SscInfo> = { sscFile: filePath };

    for (const [tag, prop] of Object.entries(TAG_MAP)) {
        const match =
            content.match(new RegExp(`^#${tag}:(.*);`, "m"));
        if (!match) continue;

        const value = match[1].trim();
        if (prop === "sampleStart" || prop === "sampleLength") {
            const num = parseFloat(value);
            found[prop] = Number.isFinite(num) ? num : null;
        } else {
            found[prop] = value;
        }
    }

    if (!found.title || !found.music) return null;
    return found as SscInfo;
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

async function cut(songDir: string, info: SscInfo): Promise<string | null> {
    if (info.sampleStart == null || info.sampleLength == null) {
        console.log(`SEM SAMPLE: ${info.title} (${path.basename(songDir)})`);
        return null;
    }

    const musicPath = await resolveMusicFile(songDir, info.music);
    if (!musicPath) {
        console.log(`SEM MP3: ${info.title} -> ${info.music}`);
        return null;
    }

    const previewPath = info.preview
        ? await resolveMusicFile(songDir, info.preview)
        : null;
    const sourcePath = previewPath ?? musicPath;

    const outFile = path.join(OUT_DIR, `${sanitizeFilename(info.title)}.mp3`);
    const duration = info.sampleLength.toFixed(6);
    const start = info.sampleStart.toFixed(6);
    const fadeStart = Math.max(0, info.sampleLength - 1).toFixed(3);

    const args = [
        "-y",
        "-hide_banner",
        "-loglevel", "error"
    ];

    if (!previewPath) {
        args.push("-ss", start);
    }

    args.push("-i", sourcePath);

    if (!previewPath) {
        args.push("-t", duration);
    }

    args.push(
        ...(previewPath
            ? []
            : ["-af", `afade=t=out:st=${fadeStart}:d=1`]),
        "-acodec", "libmp3lame",
        "-b:a", "192k",
        outFile
    );

    try {
        await execFileAsync("ffmpeg", args, { timeout: 60000 });

        const size = fs.statSync(outFile).size;
        if (size <= 0) {
            console.log(`VAZIO: ${info.title} (${path.basename(songDir)})`);
            return null;
        }

        console.log(
            `OK: ${info.title} = ${previewPath
                ? `PREVIEW ${info.preview}`
                : `${start}s+${duration}s`}
            (${outFile})`
        );
        return outFile;
    } catch (err) {
        console.log(`ERRO: ${info.title} (${path.basename(songDir)}): ${err}`);
        return null;
    }
}

const MANUAL_TITLE_TO_FILE: Record<string, string> = {
    "Rise Up (feat. Miori Celesta)": "Rise Up (feat. Miori Celesta).mp3",
    "Freedom Dive": "FREEDOM DiVE.mp3",
    "Pupa": "PUPA.mp3",
    "Extreme Music School 2nd period": "Extreme Music School 2nd period feat. Nanahira.mp3",
    "Gargoyle - FULL SONG -": "Gargoyle - FULL SONG -.mp3",
    "Love is a Danger Zone 2 Try To B.P.M": "Love is a Danger Zone (try To B.P.M.).mp3",
    "X-Tream": "X Treme.mp3",
    "Radetzky Can Can": "Radezky Can Can.mp3",
    "Miss S' story": "Miss's Story.mp3"
};

async function linkToDbByTitle() {
    const files = fs.readdirSync(OUT_DIR).filter(f => f.toLowerCase().endsWith(".mp3"));
    const byKey = new Map<string, string>();
    for (const f of files) {
        byKey.set(normalize(path.parse(f).name), f);
    }

    const songs = await prisma.song.findMany({ select: { id: true, title: true, previewPath: true } });
    let updated = 0;
    let stillMissing = 0;

    for (const song of songs) {
        const chosen =
            MANUAL_TITLE_TO_FILE[song.title] ??
            byKey.get(normalize(song.title));

        if (!chosen || !fs.existsSync(path.join(OUT_DIR, chosen))) {
            stillMissing++;
            console.log(`DB SEM PREVIEW: ${song.title}`);
            continue;
        }
        if (song.previewPath === chosen) continue;

        await prisma.song.update({ where: { id: song.id }, data: { previewPath: chosen } });
        updated++;
        console.log(`DB OK: ${song.title} -> ${chosen}`);
    }

    console.log(`\nDB: atualizados ${updated}, ainda sem preview: ${stillMissing}`);
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    let total = 0;
    let cutCount = 0;

    for (const pack of PACKS) {
        if (!fs.existsSync(pack)) {
            console.log(`Pasta não encontrada: ${pack}`);
            continue;
        }

        const entries = fs
            .readdirSync(pack, { withFileTypes: true })
            .filter(e => e.isDirectory() && !/^backup$/i.test(e.name))
            .map(e => path.join(pack, e.name))
            .sort();

        console.log(`\n=== ${path.basename(pack)} (${entries.length} músicas) ===`);

        for (const songDir of entries) {
            const sscFile = findMainSsc(songDir);
            if (!sscFile) {
                console.log(`SEM SSC: ${path.basename(songDir)}`);
                continue;
            }

            const info = parseSsc(sscFile);
            if (!info) {
                console.log(`SSC SEM INFO: ${path.basename(songDir)}`);
                continue;
            }

            if (
                TARGET_TITLES.length > 0 &&
                !TARGET_TITLES.some(t => normalize(t) === normalize(info.title))
            ) {
                continue;
            }

            total++;
            const result = await cut(songDir, info);
            if (result) cutCount++;
        }
    }

    console.log(`\n=== RESUMO ===`);
    console.log(`Processadas: ${total}, recortadas: ${cutCount}`);
    await linkToDbByTitle();
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
