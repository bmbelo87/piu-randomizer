import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    const previewsDir = path.join(process.cwd(), "uploads", "previewsongs");
    const files = fs.readdirSync(previewsDir).filter(f => f.endsWith(".mp3"));

    const previewMap = new Map<string, string>();
    for (const file of files) {
        const name = file.replace(/\.mp3$/, "");
        previewMap.set(name, file);
    }

    const songs = await prisma.song.findMany();
    let updated = 0;

    for (const song of songs) {
        if (previewMap.has(song.title)) {
            await prisma.song.update({
                where: { id: song.id },
                data: { previewPath: previewMap.get(song.title) }
            });
            updated++;
        }
    }

    console.log(`Updated ${updated} of ${songs.length} songs with previewPath`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
