// import * as fs from "fs";
// import * as path from "path";

// import { prisma } from "../src/database/prisma";

// interface JsonChart {
//     type: string;
//     level: number;
// }

// interface JsonSong {
//     id: string;
//     title: string;
//     charts: JsonChart[];
// }

// function normalize(text: string) {
//     return text
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "")
//         .replace(/[^a-z0-9]/g,"");   
// }

// async function main() {

//     const jsonPath = 
//         path.join(
//             process.cwd(),
//             "data",
//             "songs.json"
//         );

//     const bannersPath = 
//         path.join(
//             process.cwd(),
//             "uploads",
//             "banners"
//         );

//     const raw = 
//         fs.readFileSync(
//             jsonPath,
//             "utf-8"
//         );

//     const parsed =
//         JSON.parse(raw);

//     const songs = 
//         parsed.songs as JsonSong[];

//     const bannerFiles =
//         fs.readdirSync(
//             bannersPath
//         );

//     let importedSongs = 0;
//     let importedCharts = 0;
//     let matchedBanners = 0;

//     for (const song of songs) {

//         const normalizedTitle =
//             normalize(song.title);

//         const banner =
//             bannerFiles.find(
//                 (file: string) => {

//                     const name = 
//                         normalize(
//                             path.parse(file).name
//                         );

//                     return (
//                         name ===
//                         normalizedTitle
//                     );
//                 }
//             );

//         if (banner) {
//             matchedBanners++;
//         }

//         const createdSong = 
//             await prisma.song.create({

//                 data: {
//                     title:
//                     song.title,

//                     bannerPath:
//                         banner ?? ""
//                 }
//             });

//         importedSongs++;

//         for (
//             const chart
//             of song.charts
//         ) {
//             await prisma.chart.create({

//                 data: {

//                     mode:
//                         chart.type,

//                     level:
//                         chart.level,

//                     songId:
//                         createdSong.id
//                 }
//             });

//             importedCharts++;
//         }
//     }

//     console.log("");
//     console.log("=========");
//     console.log("IMPORT DONE");
//     console.log("=========");
//     console.log("");

//     console.log(
//         "Songs:",
//         importedSongs
//     );

//     console.log(
//         "Charts:",
//         importedCharts
//     );

//     console.log(
//         "Banners:",
//         matchedBanners
//     );

//     await prisma.$disconnect();
// }

// main().catch(
//     async error => {

//         console.error(
//             error
//         );

//         await prisma.$disconnect();
//     }
// );