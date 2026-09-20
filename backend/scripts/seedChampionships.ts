import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import { prisma } from "../src/database/prisma";

interface ChartSeed {
    title: string;
    level: number;
    mode?: string;
}

interface PhaseSeed {
    name: string;
    modes: string[];
    minLevel: number;
    maxLevel: number | null;
    drawCount: number;
    description?: string;
    charts?: ChartSeed[];
}

interface ChampionshipSeed {
    name: string;
    allowRepeats?: boolean;
    requiresActivation?: boolean;
    phaseActivation?: boolean;
    phases: PhaseSeed[];
}

const intermediateCharts = {
    "1a Fase": [
        { title: "Punishment Restaurant", level: 11 },
        { title: "Rise Up (feat. Miori Celesta)", level: 11 },
        { title: "Digitalis", level: 11 },
        { title: "B3", level: 11 },
        { title: "We Love Your Step", level: 11 },
        { title: "Euphorianic", level: 11 },
        { title: "Etude OP 10-4", level: 11 },
        { title: "OVERNIGHT FLOWER", level: 12 },
        { title: "SUPER☆HARAGURO☆POP", level: 12 },
        { title: "Antique Serenade", level: 12 },
        { title: "Cynical", level: 12 },
        { title: "NightTheater", level: 12 },
        { title: "Horang Pungryuga", level: 12 },
        { title: "Earendel", level: 12 },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 13 },
        { title: "Crash-Landing Rendezvous", level: 13 },
        { title: "Freedom Dive", level: 13 },
        { title: "DUEL", level: 13 },
        { title: "Airplane", level: 13 },
        { title: "Deca Dance", level: 13 },
        { title: "Jupin", level: 13 }
    ],
    "2a Fase": [
        { title: "Digitalis", level: 14 },
        { title: "We Love Your Step", level: 14 },
        { title: "T.B.H", level: 14 },
        { title: "Spooky Macaron", level: 14 },
        { title: "The Apocalypse", level: 14 },
        { title: "QUATTUORUX", level: 15 },
        { title: "Ercitite", level: 15 },
        { title: "Hymn of Golden Glory", level: 15 },
        { title: "Nade Nade", level: 15 },
        { title: "Acquire", level: 15 }
    ],
    "Final": [
        { title: "Cynical", level: 16 },
        { title: "SUPER☆HARAGURO☆POP", level: 16 },
        { title: "Rise Up (feat. Miori Celesta)", level: 16 },
        { title: "CALL ME BACK", level: 16 },
        { title: "Dreamchasers", level: 17 },
        { title: "Unfelicitas", level: 17 },
        { title: "Punishment Restaurant", level: 17 },
        { title: "DIE ANOTHER DAY", level: 17 }
    ]
};

const legendsCharts = {
    "S22": [
        { title: "DUEL", mode: "S", level: 22 },
        { title: "Alice in Misanthrope", mode: "S", level: 22 },
        { title: "Halcyon", mode: "S", level: 22 },
        { title: "Dignity", mode: "S", level: 22 },
        { title: "BEDLAM", mode: "S", level: 22 }
    ],
    "S23": [
        { title: "Heliosphere", mode: "S", level: 23 },
        { title: "VVV", mode: "S", level: 23 },
        { title: "Dement ~After Legend~", mode: "S", level: 23 },
        { title: "Kugutsu", mode: "S", level: 23 },
        { title: "1949", mode: "S", level: 23 }
    ],
    "S24": [
        { title: "Skeptic", mode: "S", level: 24 },
        { title: "Extreme Music School 2nd period", mode: "S", level: 24 },
        { title: "Hercules", mode: "S", level: 24 },
        { title: "Xeroize", mode: "S", level: 24 },
        { title: "iRELLiA", mode: "S", level: 24 }
    ],
    "D25": [
        { title: "Heliosphere", mode: "D", level: 25 },
        { title: "Ultimatum", mode: "D", level: 25 },
        { title: "Etude OP 10-4", mode: "D", level: 25 },
        { title: "Galaxy Collapse", mode: "D", level: 25 },
        { title: "Imperium", mode: "D", level: 25 },
        { title: "Ghost Bloody Train", mode: "D", level: 25 }
    ],
    "D26": [
        { title: "OVERNIGHT FLOWER", mode: "D", level: 26 },
        { title: "CHAOS AGAIN", mode: "D", level: 26 },
        { title: "Aragami", mode: "D", level: 26 },
        { title: "Fracture Temporelle", mode: "D", level: 26 },
        { title: "QUATTUORUX", mode: "D", level: 26 }
    ],
    "D27": [
        { title: "Legendary Dominion", mode: "D", level: 27 },
        { title: "1950", mode: "D", level: 27 },
        { title: "Ultimatum", mode: "D", level: 27 },
        { title: "Kugutsu", mode: "D", level: 27 },
        { title: "Freedom Dive", mode: "D", level: 27 },
        { title: "L (PIU Edit)", mode: "D", level: 27 }
    ]
};

const coopCharts = {
    "1a Fase (Lower Level)": [
        { title: "Do the Dance", mode: "X2", level: 1 },
        { title: "BANG BANG", mode: "X2", level: 2 },
        { title: "Stardream (feat. Romelon)", mode: "X2", level: 3 },
        { title: "Goodbounce", mode: "X2", level: 4 },
        { title: "Sugar Plum", mode: "X2", level: 5 },
        { title: "Xuxa", mode: "X2", level: 6 },
        { title: "Removable Disk0", mode: "X2", level: 7 }
    ],
    "2a Fase (Middle Level)": [
        { title: "We Love Your Step", mode: "X2", level: 1 },
        { title: "Nakakapagpabagabag", mode: "X2", level: 2 },
        { title: "Csikos Post", mode: "X2", level: 3 },
        { title: "Fly High", mode: "X2", level: 4 },
        { title: "Cross Over feat. LyuU", mode: "X2", level: 5 },
        { title: "Doppelganger", mode: "X2", level: 6 },
        { title: "Fires of Destiny", mode: "X2", level: 7 }
    ],
    "Final (Upper Level)": [
        { title: "Conflict", mode: "X2", level: 1 },
        { title: "Loki", mode: "X2", level: 2 },
        { title: "Tales of Pumpnia", mode: "X2", level: 3 },
        { title: "HTTP", mode: "X2", level: 4 },
        { title: "SWEET WONDERLAND", mode: "X2", level: 5 },
        { title: "BSPower Explosion", mode: "X2", level: 6 },
        { title: "VANISH", mode: "X2", level: 7 }
    ]
};

const semBarraCharts = {
    "1a Fase": [
        { title: "Pump Jump", level: 15 },
        { title: "Get Up", level: 15 },
        { title: "Ladybug", level: 15 },
        { title: "X-Tream", level: 15 },
        { title: "Naissance 2", level: 15 },
        { title: "All I Want For X-mas", level: 15 },
        { title: "J Bong", level: 15 },
        { title: "My Way", level: 16 },
        { title: "Final Audition 3", level: 16 },
        { title: "Pumping Jumping", level: 16 },
        { title: "Higgledy Piggledy", level: 16 },
        { title: "N", level: 16 },
        { title: "Winter", level: 16 },
        { title: "Vook", level: 16 }
    ],
    "2a Fase": [
        { title: "Blazing", level: 17 },
        { title: "DJ Otada", level: 17 },
        { title: "Radetzky Can Can", level: 17 },
        { title: "Final Audition Ep. 1", level: 17 },
        { title: "Hello", level: 17 },
        { title: "My Dreams", level: 18 },
        { title: "Solitary 2", level: 18 },
        { title: "Necromancy", level: 18 },
        { title: "Beat The Ghost", level: 18 },
        { title: "Pump me Amadeus", level: 18 }
    ],
    "3a Fase": [
        { title: "Witch Doctor #1", level: 19 },
        { title: "Destination", level: 19 },
        { title: "Bee", level: 19 },
        { title: "Extravaganza", level: 19 },
        { title: "Miss S' story", level: 19 },
        { title: "Pumptris Quattro", level: 20 },
        { title: "Love is a Danger Zone", level: 20 },
        { title: "Cannon X.1", level: 20 },
        { title: "Canon D", level: 20 },
        { title: "Mr. Larpus", level: 20 }
    ],
    "Final": [
        { title: "Love is a Danger Zone 2 Try To B.P.M", level: 21 },
        { title: "WI-EX-DOC-VA", level: 21 },
        { title: "Gargoyle - FULL SONG -", level: 21 },
        { title: "Ignis Fatuus(DM Ashura Mix)", level: 22 },
        { title: "Napalm", level: 22 },
        { title: "Love is a Danger Zone pt. 2", level: 22 }
    ]
};

const masterCharts = {
    "1a Fase": [
        { title: "Punishment Restaurant", level: 21, mode: "S" },
        { title: "Digitalis", level: 21, mode: "S" },
        { title: "Ercitite", level: 21, mode: "S" },
        { title: "Antique Serenade", level: 21, mode: "S" },
        { title: "Cynical", level: 21, mode: "S" },
        { title: "PRiMA MATERiA", level: 21, mode: "S" },
        { title: "Big Daddy", level: 21, mode: "S" },
        { title: "Rise Up (feat. Miori Celesta)", level: 22, mode: "S" },
        { title: "OVERNIGHT FLOWER", level: 22, mode: "S" },
        { title: "We Love Your Step", level: 22, mode: "S" },
        { title: "BLAZOR", level: 22, mode: "S" },
        { title: "Freedom Dive", level: 22, mode: "S" },
        { title: "iRELLiA", level: 22, mode: "S" },
        { title: "Barber's Madness", level: 22, mode: "S" }
    ],
    "2a Fase": [
        { title: "The Last Rebellion", level: 23, mode: "S" },
        { title: "Enjoy The Show", level: 23, mode: "S" },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 23, mode: "S" },
        { title: "Mopemope", level: 23, mode: "S" },
        { title: "Dead End", level: 23, mode: "S" },
        { title: "The Last Rebellion", level: 23, mode: "D" },
        { title: "404 (New Era)", level: 23, mode: "D" },
        { title: "Antique Serenade", level: 23, mode: "D" },
        { title: "Enjoy The Show", level: 23, mode: "D" },
        { title: "Jupin", level: 23, mode: "D" }
    ],
    "3a Fase": [
        { title: "OVERNIGHT FLOWER", level: 24, mode: "S" },
        { title: "QUATTUORUX", level: 24, mode: "S" },
        { title: "* this game does not exist *", level: 24, mode: "S" },
        { title: "Xeroize", level: 24, mode: "S" },
        { title: "Fracture Temporelle", level: 24, mode: "S" },
        { title: "SUPER☆HARAGURO☆POP", level: 24, mode: "D" },
        { title: "QUATTUORUX", level: 24, mode: "D" },
        { title: "Unfelicitas", level: 24, mode: "D" },
        { title: "Dizzy Dance, Street Light", level: 24, mode: "D" },
        { title: "We Love Your Step", level: 24, mode: "D" }
    ],
    "Final": [
        { title: "Legendary Dominion", level: 25, mode: "D" },
        { title: "Enjoy The Show", level: 25, mode: "D" },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 25, mode: "D" },
        { title: "The Stranger", level: 25, mode: "D" },
        { title: "QUATTUORUX", level: 26, mode: "D" },
        { title: "OVERNIGHT FLOWER", level: 26, mode: "D" },
        { title: "Super Akuma Emperor", level: 26, mode: "D" }
    ]
};

const expertDoubleCharts = {
    "1a Fase": [
        { title: "Ercitite", level: 19 },
        { title: "Cynical", level: 19 },
        { title: "Enjoy The Show", level: 19 },
        { title: "Simon Says, EURODANCE!! (feat. Sara☆M)", level: 19 },
        { title: "Eternal Universe", level: 19 },
        { title: "Lohxia", level: 19 },
        { title: "†DOOF†SENC†", level: 19 },
        { title: "Rise Up (feat. Miori Celesta)", level: 20 },
        { title: "OVERNIGHT FLOWER", level: 20 },
        { title: "404 (New Era)", level: 20 },
        { title: "Antique Serenade", level: 20 },
        { title: "Destr0yer", level: 20 },
        { title: "Giselle", level: 20 },
        { title: "ESP", level: 20 }
    ],
    "2a Fase": [
        { title: "QUATTUORUX", level: 21 },
        { title: "Legendary Dominion", level: 21 },
        { title: "Pull me up (Feat. Monya)", level: 21 },
        { title: "Crash-Landing Rendezvous", level: 21 },
        { title: "B3", level: 21 },
        { title: "T.B.H", level: 22 },
        { title: "Punishment Restaurant", level: 22 },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 22 },
        { title: "Do the Dance", level: 22 },
        { title: "Dizzy Dance, Street Light", level: 22 }
    ],
    "Final": [
        { title: "BANG BANG", level: 23 },
        { title: "The Last Rebellion", level: 23 },
        { title: "Enjoy The Show", level: 23 },
        { title: "Ghost Bloody Train", level: 23 },
        { title: "We Love Your Step", level: 24 },
        { title: "King's Tomb", level: 24 },
        { title: "Freedom Dive", level: 24 },
        { title: "L (PIU Edit)", level: 24 }
    ]
};

const expertSingleCharts = {
    "1a Fase": [
        { title: "Digitalis", level: 18 },
        { title: "SUPER☆HARAGURO☆POP", level: 18 },
        { title: "NightTheater", level: 18 },
        { title: "BANG BANG", level: 18 },
        { title: "B3", level: 18 },
        { title: "TRICKL4SH 220", level: 18 },
        { title: "Dement ~After Legend~", level: 18 },
        { title: "Crash-Landing Rendezvous", level: 19 },
        { title: "Pull me up (Feat. Monya)", level: 19 },
        { title: "Re:End of a Dream", level: 19 },
        { title: "Nyan-turne (feat. KuTiNA)", level: 19 },
        { title: "Conflict", level: 19 },
        { title: "Athena's Shield", level: 19 },
        { title: "E.O.N", level: 19 },
        { title: "We Love Your Step", level: 20 },
        { title: "Dreamchasers", level: 20 },
        { title: "King's Tomb", level: 20 },
        { title: "Lucky Star", level: 20 },
        { title: "Dizzy Dance, Street Light", level: 20 },
        { title: "Neo Catharsis", level: 20 },
        { title: "Doppelganger", level: 20 }
    ],
    "2a Fase": [
        { title: "Punishment Restaurant", level: 21 },
        { title: "Cynical", level: 21 },
        { title: "404 (New Era)", level: 21 },
        { title: "The Last Rebellion", level: 21 },
        { title: "Ercitite", level: 21 },
        { title: "Rise Up (feat. Miori Celesta)", level: 22 },
        { title: "Legendary Dominion", level: 22 },
        { title: "King's Tomb", level: 22 },
        { title: "T.B.H", level: 22 },
        { title: "Unfelicitas", level: 22 }
    ],
    "Final": [
        { title: "Enjoy The Show", level: 23 },
        { title: "The Last Rebellion", level: 23 },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 23 },
        { title: "Ghost Bloody Train", level: 23 },
        { title: "QUATTUORUX", level: 24 },
        { title: "OVERNIGHT FLOWER", level: 24 },
        { title: "Super Akuma Emperor", level: 24 },
        { title: "L (PIU Edit)", level: 24 }
    ]
};

const advancedCharts = {
    "1a Fase": [
        { title: "Do the Dance", level: 15 },
        { title: "QUATTUORUX", level: 15 },
        { title: "Ercitite", level: 15 },
        { title: "Dreamchasers", level: 15 },
        { title: "Lucky Star", level: 15 },
        { title: "Switronic", level: 15 },
        { title: "Mopemope", level: 15 },
        { title: "404 (New Era)", level: 16 },
        { title: "BANG BANG", level: 16 },
        { title: "The Last Rebellion", level: 16 },
        { title: "Pull me up (Feat. Monya)", level: 16 },
        { title: "Dizzy Dance, Street Light", level: 16 },
        { title: "8 6", level: 16 },
        { title: "Energy Synergy Matrix", level: 16 },
        { title: "Do the Dance", level: 17 },
        { title: "King's Tomb", level: 17 },
        { title: "T.B.H", level: 17 },
        { title: "Unfelicitas", level: 17 },
        { title: "Pupa", level: 17 },
        { title: "Demon of Laplace", level: 17 },
        { title: "Stardream -Eurobeat Remix-", level: 17 }
    ],
    "2a Fase": [
        { title: "Digitalis", level: 18 },
        { title: "Enjoy The Show", level: 18 },
        { title: "INFiNiTE ENERZY -Overdoze-", level: 18 },
        { title: "Rise Up (feat. Miori Celesta)", level: 18 },
        { title: "Cynical", level: 18 },
        { title: "OVERNIGHT FLOWER", level: 19 },
        { title: "The Last Rebellion", level: 19 },
        { title: "QUATTUORUX", level: 19 },
        { title: "Appassionata", level: 19 },
        { title: "Jupin", level: 19 }
    ],
    "Final": [
        { title: "Legendary Dominion", level: 20 },
        { title: "Lucky Star", level: 20 },
        { title: "That Kitty (PIU Edit.)", level: 20 },
        { title: "The Stranger", level: 20 },
        { title: "Ercitite", level: 21 },
        { title: "BANG BANG", level: 21 },
        { title: "Stardream (feat. Romelon)", level: 21 },
        { title: "Ghost Bloody Train", level: 21 }
    ]
};

const championships: ChampionshipSeed[] = [
    {
        name: "Intermediate",
        phases: [
            { name: "1a Fase", modes: ["S"], minLevel: 11, maxLevel: 13, drawCount: 3, charts: intermediateCharts["1a Fase"] },
            { name: "2a Fase", modes: ["S"], minLevel: 14, maxLevel: 15, drawCount: 2, charts: intermediateCharts["2a Fase"] },
            { name: "Final", modes: ["S"], minLevel: 16, maxLevel: 17, drawCount: 2, charts: intermediateCharts["Final"] }
        ]
    },
    {
        name: "Advanced",
        phases: [
            { name: "1a Fase", modes: ["S"], minLevel: 15, maxLevel: 17, drawCount: 3, charts: advancedCharts["1a Fase"] },
            { name: "2a Fase", modes: ["S"], minLevel: 18, maxLevel: 19, drawCount: 2, charts: advancedCharts["2a Fase"] },
            { name: "Final", modes: ["S"], minLevel: 20, maxLevel: 21, drawCount: 2, charts: advancedCharts["Final"] }
        ]
    },
    {
        name: "Expert Single",
        phases: [
            { name: "1a Fase", modes: ["S"], minLevel: 18, maxLevel: 20, drawCount: 3, charts: expertSingleCharts["1a Fase"] },
            { name: "2a Fase", modes: ["S"], minLevel: 21, maxLevel: 22, drawCount: 2, charts: expertSingleCharts["2a Fase"] },
            { name: "Final", modes: ["S"], minLevel: 23, maxLevel: 24, drawCount: 2, charts: expertSingleCharts["Final"] }
        ]
    },
    {
        name: "Expert Double",
        phases: [
            { name: "1a Fase", modes: ["D"], minLevel: 19, maxLevel: 20, drawCount: 2, charts: expertDoubleCharts["1a Fase"] },
            { name: "2a Fase", modes: ["D"], minLevel: 21, maxLevel: 22, drawCount: 2, charts: expertDoubleCharts["2a Fase"] },
            { name: "Final", modes: ["D"], minLevel: 23, maxLevel: 24, drawCount: 2, charts: expertDoubleCharts["Final"] }
        ]
    },
    {
        name: "Master",
        phases: [
            { name: "1a Fase", modes: ["S", "D"], minLevel: 21, maxLevel: 22, drawCount: 2, description: "S21 e S22", charts: masterCharts["1a Fase"] },
            { name: "2a Fase", modes: ["S", "D"], minLevel: 23, maxLevel: 23, drawCount: 2, description: "S23 e D23", charts: masterCharts["2a Fase"] },
            { name: "3a Fase", modes: ["S", "D"], minLevel: 24, maxLevel: 24, drawCount: 2, description: "S24 e D24", charts: masterCharts["3a Fase"] },
            { name: "Final", modes: ["S", "D"], minLevel: 25, maxLevel: 26, drawCount: 2, description: "D25 e D26", charts: masterCharts["Final"] }
        ]
    },
    {
        name: "Sem Barra",
        phases: [
            { name: "1a Fase", modes: ["S"], minLevel: 15, maxLevel: 16, drawCount: 2, charts: semBarraCharts["1a Fase"] },
            { name: "2a Fase", modes: ["S"], minLevel: 17, maxLevel: 18, drawCount: 2, charts: semBarraCharts["2a Fase"] },
            { name: "3a Fase", modes: ["S"], minLevel: 19, maxLevel: 20, drawCount: 2, charts: semBarraCharts["3a Fase"] },
            { name: "Final", modes: ["S"], minLevel: 21, maxLevel: 22, drawCount: 2, charts: semBarraCharts["Final"] }
        ]
    },
    {
        name: "CO-OP X2",
        phases: [
            { name: "1a Fase (Lower Level)", modes: ["X2"], minLevel: 1, maxLevel: null, drawCount: 2, charts: coopCharts["1a Fase (Lower Level)"] },
            { name: "2a Fase (Middle Level)", modes: ["X2"], minLevel: 1, maxLevel: null, drawCount: 2, charts: coopCharts["2a Fase (Middle Level)"] },
            { name: "Final (Upper Level)", modes: ["X2"], minLevel: 1, maxLevel: null, drawCount: 2, charts: coopCharts["Final (Upper Level)"] }
        ]
    },
    {
        name: "Legends",
        allowRepeats: true,
        requiresActivation: true,
        phaseActivation: false,
        phases: [
            { name: "S22", modes: ["S"], minLevel: 22, maxLevel: 22, drawCount: 1, description: "S22", charts: legendsCharts.S22 },
            { name: "S23", modes: ["S"], minLevel: 23, maxLevel: 23, drawCount: 1, description: "S23", charts: legendsCharts.S23 },
            { name: "S24", modes: ["S"], minLevel: 24, maxLevel: 24, drawCount: 1, description: "S24", charts: legendsCharts.S24 },
            { name: "D25", modes: ["D"], minLevel: 25, maxLevel: 25, drawCount: 1, description: "D25", charts: legendsCharts.D25 },
            { name: "D26", modes: ["D"], minLevel: 26, maxLevel: 26, drawCount: 1, description: "D26", charts: legendsCharts.D26 },
            { name: "D27", modes: ["D"], minLevel: 27, maxLevel: 27, drawCount: 1, description: "D27", charts: legendsCharts.D27 }
        ]
    }
];

async function safeDeleteChampionships() {
    const count = await prisma.championship.deleteMany({});
    console.log(`Removed existing championships: ${count.count}`);
}

function displayMode(modes: string[]) {
    return modes.length === 1
        ? modes[0]
        : modes.join("/");
}

function normalize(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

async function ensureChart(
    entry: ChartSeed,
    mode: string,
    songIdByTitle: Map<string, string>
) {
    const key = normalize(entry.title);
    let songId = songIdByTitle.get(key);

    if (!songId) {
        const created = await prisma.song.create({
            data: {
                title: entry.title,
                bannerPath: ""
            }
        });

        songId = created.id;
        songIdByTitle.set(key, songId);
    }

    let chart = await prisma.chart.findFirst({
        where: {
            songId,
            mode,
            level: entry.level
        }
    });

    if (!chart) {
        chart = await prisma.chart.create({
            data: {
                songId,
                mode,
                level: entry.level
            }
        });
    }

    return chart.id;
}

async function seedPhase(
    championshipId: string,
    seed: PhaseSeed,
    order: number,
    songIdByTitle: Map<string, string>
) {
    const phase = await prisma.phase.create({
        data: {
            championshipId,
            name: seed.name,
            order,
            mode: displayMode(seed.modes),
            minLevel: seed.minLevel,
            maxLevel: seed.maxLevel,
            allowOver: seed.maxLevel === null,
            drawCount: seed.drawCount,
            description: seed.description ?? null
        }
    });

    if (seed.charts) {
        const chartIds: string[] = [];
        const missing = new Set<string>();

        for (const entry of seed.charts) {
            const mode = entry.mode ?? seed.modes[0];

            const chartId = await ensureChart(
                entry,
                mode,
                songIdByTitle
            );

            if (!chartId) {
                missing.add(entry.title);
                continue;
            }

            if (!chartIds.includes(chartId)) {
                chartIds.push(chartId);
            }
        }

        if (chartIds.length > 0) {
            await prisma.phaseChart.createMany({
                data: chartIds.map((chartId) => ({
                    phaseId: phase.id,
                    chartId
                }))
            });
        }

        console.log(
            `  - ${seed.name}: ${seed.modes.join("/")} ` +
            `${seed.minLevel}~${seed.maxLevel ?? "+"} ` +
            `(draw ${seed.drawCount}) pool=${chartIds.length}`
        );

        if (missing.size > 0) {
            console.log(
                `    WARNING missing: ${Array.from(missing).join("; ")}`
            );
        }

        return;
    }

    const charts = await prisma.chart.findMany({
        where: {
            mode: { in: seed.modes },
            level: seed.maxLevel === null
                ? { gte: seed.minLevel }
                : { gte: seed.minLevel, lte: seed.maxLevel }
        },
        select: { id: true }
    });

    if (charts.length > 0) {
        await prisma.phaseChart.createMany({
            data: charts.map((chart) => ({
                phaseId: phase.id,
                chartId: chart.id
            }))
        });
    }

    console.log(
        `  - ${seed.name}: ${seed.modes.join("/")} ` +
        `${seed.minLevel}~${seed.maxLevel ?? "+"} ` +
        `(draw ${seed.drawCount}) pool=${charts.length}`
    );
}

async function linkPreviews(
    songIdByTitle: Map<string, string>
) {
    const previewDir = path.join(
        process.cwd(),
        "uploads",
        "previewsongs"
    );

    if (!fs.existsSync(previewDir)) {
        console.log("Preview directory not found");
        return;
    }

    const files = fs.readdirSync(previewDir);

    const previewByKey = new Map<string, string>();

    for (const file of files) {
        if (
            path.extname(file).toLowerCase() !== ".mp3"
        ) {
            continue;
        }

        previewByKey.set(
            normalize(path.parse(file).name),
            file
        );
    }

    const manual: Record<string, string> = {
        "Rise Up (feat. Miori Celesta)":
            "Rise Up (feat. Miori Celesta).mp3",
        "Freedom Dive":
            "FREEDOM DiVE.mp3",
        "Pupa":
            "PUPA.mp3",
        "Extreme Music School 2nd period":
            "Extreme Music School 2nd period feat. Nanahira.mp3",
        "Gargoyle - FULL SONG -":
            "Gargoyle - FULL SONG -.mp3",
        "Love is a Danger Zone 2 Try To B.P.M":
            "Love is a Danger Zone 2.mp3"
    };

    const titles = [
        ...new Set(
            championships.flatMap(
                championship =>
                    championship.phases.flatMap(
                        phase =>
                            phase.charts?.map(
                                chart => chart.title
                            ) ?? []
                    )
            )
        )
    ];

    const missingFiles: string[] = [];

    for (const title of titles) {
        const previewFile =
            manual[title] ??
            previewByKey.get(normalize(title));

        const songId =
            songIdByTitle.get(normalize(title));

        if (
            !songId ||
            !previewFile ||
            !fs.existsSync(path.join(previewDir, previewFile))
        ) {
            missingFiles.push(title);
            continue;
        }

        const song = await prisma.song.findUnique({
            where: {
                id: songId
            },
            select: {
                previewPath: true
            }
        });

        if (!song || song.previewPath === previewFile) {
            continue;
        }

        await prisma.song.update({
            where: {
                id: songId
            },
            data: {
                previewPath: previewFile
            }
        });

        console.log(
            `Preview: ${title} -> ${previewFile}`
        );
    }

    if (missingFiles.length > 0) {
        console.log(
            `WARNING no preview: ${missingFiles.join("; ")}`
        );
    }
}

async function linkBanners(
    songIdByTitle: Map<string, string>
) {
    const bannerDir = path.join(
        process.cwd(),
        "uploads",
        "banners"
    );

    if (!fs.existsSync(bannerDir)) {
        console.log("Banner directory not found");
        return;
    }

    const files = fs.readdirSync(bannerDir);

    const bannerByKey = new Map<string, string>();

    for (const file of files) {
        bannerByKey.set(
            normalize(path.parse(file).name),
            file
        );
    }

    const manual: Record<string, string> = {
        "Rise Up (feat. Miori Celesta)":
            "Rise Up (feat. Miori Celesta).png",
        "Stardream (feat. Romelon)":
            "Stardream (feat. Romelon).png",
        "Extreme Music School 2nd period":
            "Extreme Music School 2nd period.png",
        "Gargoyle - FULL SONG -":
            "Gargoyle.png",
        "Love is a Danger Zone 2 Try To B.P.M":
            "Love is a Danger Zone 2 Try To B.P.M.png"
    };

    const titles = [
        ...new Set(
            championships.flatMap(
                championship =>
                    championship.phases.flatMap(
                        phase =>
                            phase.charts?.map(
                                chart => chart.title
                            ) ?? []
                    )
            )
        )
    ];

    const missingFiles: string[] = [];

    for (const title of titles) {
        const bannerFile =
            manual[title] ??
            bannerByKey.get(normalize(title));

        const songId =
            songIdByTitle.get(
                normalize(title)
            );

        if (
            !songId ||
            !bannerFile ||
            !fs.existsSync(path.join(bannerDir, bannerFile))
        ) {
            missingFiles.push(title);
            continue;
        }

        const song = await prisma.song.findUnique({
            where: {
                id: songId
            },
            select: {
                bannerPath: true
            }
        });

        if (!song || song.bannerPath === bannerFile) {
            continue;
        }

        await prisma.song.update({
            where: {
                id: songId
            },
            data: {
                bannerPath: bannerFile
            }
        });

        console.log(
            `Banner: ${title} -> ${bannerFile}`
        );
    }

    if (missingFiles.length > 0) {
        console.log(
            `WARNING no banner/song: ${missingFiles.join("; ")}`
        );
    }
}

async function main() {
    await safeDeleteChampionships();

    const songs = await prisma.song.findMany({
        select: {
            id: true,
            title: true
        }
    });

    const songIdByTitle = new Map<string, string>();

    for (const song of songs) {
        songIdByTitle.set(normalize(song.title), song.id);
    }

    for (let index = 0; index < championships.length; index++) {
        const championship = championships[index];

        const created = await prisma.championship.create({
            data: {
                name: championship.name,
                order: index,
                allowRepeats: championship.allowRepeats ?? false,
                requiresActivation: championship.requiresActivation ?? true,
                phaseActivation: championship.phaseActivation ?? true
            }
        });

        console.log(`Created: ${created.name}`);

        for (let i = 0; i < championship.phases.length; i++) {
            await seedPhase(
                created.id,
                championship.phases[i],
                i + 1,
                songIdByTitle
            );
        }
    }

    await linkBanners(songIdByTitle);
    await linkPreviews(songIdByTitle);

    console.log("");
    console.log("SEED DONE");

    await prisma.$disconnect();
}

main()
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });