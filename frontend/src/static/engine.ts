/**
 * Reimplementacao da API do backend (backend/src/controllers) para rodar
 * inteiramente no navegador, usada no build do GitHub Pages.
 *
 * Mantem os mesmos caminhos, formatos de resposta, validacoes e mensagens de
 * erro do backend. Sem dependencias de DOM/Vite para poder ser testada em Node.
 */

export interface Championship {
    id: string;
    name: string;
    createdAt: string;
    order: number;
    allowRepeats: boolean;
    requiresActivation: boolean;
    phaseActivation: boolean;
    displayClearedAt: string | null;
    currentPhaseId: string | null;
}

export interface Phase {
    id: string;
    drawCount: number;
    name: string;
    order: number;
    mode: string;
    description: string | null;
    minLevel: number;
    maxLevel: number | null;
    allowOver: boolean;
    championshipId: string;
}

export interface Song {
    id: string;
    title: string;
    bannerPath: string;
    previewPath: string | null;
}

export interface Chart {
    id: string;
    mode: string;
    level: number;
    songId: string;
}

export interface Draw {
    id: string;
    round: number;
    seed: string;
    createdAt: string;
    phaseId: string;
    chartId: string;
}

export interface PhaseChart {
    id: string;
    phaseId: string;
    chartId: string;
}

export interface Db {
    championships: Championship[];
    phases: Phase[];
    songs: Song[];
    charts: Chart[];
    phaseCharts: PhaseChart[];
    draws: Draw[];
}

export interface Store {
    read(): string | null;
    write(value: string): void;
}

export interface EngineResponse {
    status: number;
    data: unknown;
}

class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function fail(status: number, message: string): never {
    throw new HttpError(status, message);
}

// ---------- utilidades ----------

function randomBytes(length: number) {
    return crypto.getRandomValues(new Uint8Array(length));
}

function randomHex(bytes: number) {
    return Array.from(randomBytes(bytes), b => b.toString(16).padStart(2, "0")).join("");
}

/** Equivalente a crypto.randomInt(min, max): inteiro uniforme em [min, max). */
function randomInt(min: number, max: number) {
    const range = max - min;
    const limit = Math.floor(0x100000000 / range) * range;
    const buffer = new Uint32Array(1);

    do {
        crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return min + (buffer[0] % range);
}

function newId() {
    return `c${randomHex(12)}`;
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

// ---------- includes (equivalentes aos `include` do Prisma) ----------

function withSong(db: Db, chart: Chart) {
    return {
        ...chart,
        song: db.songs.find(song => song.id === chart.songId)!
    };
}

function withChart(db: Db, phaseChart: PhaseChart) {
    return {
        ...phaseChart,
        chart: withSong(db, db.charts.find(chart => chart.id === phaseChart.chartId)!)
    };
}

function withChartAndSong(db: Db, draw: Draw) {
    return {
        ...draw,
        chart: withSong(db, db.charts.find(chart => chart.id === draw.chartId)!)
    };
}

function withPhases(db: Db, championship: Championship) {
    return {
        ...championship,
        phases: db.phases.filter(phase => phase.championshipId === championship.id)
    };
}

/**
 * O SQLite le PhaseChart pelo indice unico (phaseId, chartId), entao o backend
 * devolve os charts de uma fase ordenados por chartId. Repete o mesmo aqui.
 */
function phaseChartsOf(db: Db, phaseId: string) {
    return db.phaseCharts
        .filter(pc => pc.phaseId === phaseId)
        .sort((a, b) => (a.chartId < b.chartId ? -1 : a.chartId > b.chartId ? 1 : 0));
}

function findPhase(db: Db, id: string) {
    return db.phases.find(phase => phase.id === id);
}

/**
 * Categoria com ativacao por fase: so a fase ativa sorteia.
 * Categoria sem fases (phaseActivation = false, ex.: Legends): basta a categoria estar ativa.
 */
function isActiveFor(championship: Championship, phaseId: string) {
    return championship.phaseActivation
        ? championship.currentPhaseId === phaseId
        : championship.currentPhaseId !== null;
}

function championshipOfPhase(db: Db, phaseId: string) {
    const phase = findPhase(db, phaseId);
    return phase && db.championships.find(c => c.id === phase.championshipId);
}

function sortedBy<T>(list: T[], compare: (a: T, b: T) => number) {
    return list
        .map((item, index) => ({ item, index }))
        .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
        .map(entry => entry.item);
}

function drawSummary(draw: { chart: Chart & { song: Song } }) {
    return {
        song: draw.chart.song.title,
        bannerPath: draw.chart.song.bannerPath,
        previewPath: draw.chart.song.previewPath ?? null,
        mode: draw.chart.mode,
        level: draw.chart.level
    };
}

// ---------- championships ----------

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function createChampionship(db: Db, body: Body) {
    const { name, phases, allowRepeats, requiresActivation, phaseActivation } = body;

    const championship: Championship = {
        id: newId(),
        name,
        createdAt: new Date().toISOString(),
        order: db.championships.reduce((max, c) => Math.max(max, c.order), -1) + 1,
        allowRepeats: allowRepeats ?? false,
        requiresActivation: requiresActivation ?? true,
        phaseActivation: phaseActivation ?? true,
        displayClearedAt: null,
        currentPhaseId: null
    };

    const created: Phase[] = (phases as Body[]).map((phase, index) => ({
        id: newId(),
        drawCount: phase.drawCount ?? 2,
        name: phase.name,
        order: index + 1,
        mode: phase.mode,
        description: phase.description ?? null,
        minLevel: phase.minLevel,
        maxLevel: phase.maxLevel ?? null,
        allowOver: phase.allowOver ?? false,
        championshipId: championship.id
    }));

    db.championships.push(championship);
    db.phases.push(...created);

    return { ...championship, phases: created };
}

function deleteChampionship(db: Db, id: string) {
    const championship = db.championships.find(c => c.id === id);

    if (!championship) {
        throw new Error("Record to delete does not exist");
    }

    const phaseIds = new Set(
        db.phases.filter(phase => phase.championshipId === id).map(phase => phase.id)
    );

    db.draws = db.draws.filter(draw => !phaseIds.has(draw.phaseId));
    db.phaseCharts = db.phaseCharts.filter(pc => !phaseIds.has(pc.phaseId));
    db.phases = db.phases.filter(phase => !phaseIds.has(phase.id));
    db.championships = db.championships.filter(c => c.id !== id);

    return { success: true };
}

function setCurrentPhase(db: Db, id: string, body: Body) {
    const { phaseId } = body;

    if (phaseId) {
        for (const other of db.championships) {
            if (other.id !== id && other.currentPhaseId !== null) {
                other.currentPhaseId = null;
            }
        }
    }

    const championship = db.championships.find(c => c.id === id);

    if (!championship) {
        throw new Error("Record to update not found");
    }

    if (phaseId !== undefined) {
        championship.currentPhaseId = phaseId;
    }

    return championship;
}

/** Limpa o telao sem apagar o historico: so passa a mostrar sorteios feitos daqui em diante. */
function clearDisplay(db: Db, id: string) {
    const championship = db.championships.find(c => c.id === id);

    if (!championship) {
        throw new Error("Record to update not found");
    }

    championship.displayClearedAt = new Date().toISOString();

    return championship;
}

/** Uma musica por vez: so o ultimo sorteio, e so se veio depois de "limpar display". */
function latestDrawGroup(draws: Draw[], clearedAt: string | null) {
    let latest: Draw | undefined;

    for (const draw of draws) {
        if (!latest || draw.createdAt >= latest.createdAt) {
            latest = draw;
        }
    }

    if (!latest || (clearedAt && latest.createdAt <= clearedAt)) {
        return [];
    }

    // sorteios da mesma chamada compartilham a seed
    return draws.filter(draw => draw.seed === latest.seed);
}

// ---------- phases ----------

function getPhase(db: Db, id: string) {
    const phase = findPhase(db, id);

    if (!phase) {
        fail(404, "Phase not found");
    }

    const draws = db.draws.filter(draw => draw.phaseId === id);

    return {
        ...phase,
        availableCharts: phaseChartsOf(db, id).map(pc => withChart(db, pc)),
        draws: sortedBy(draws, (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
            .map(draw => withChartAndSong(db, draw))
    };
}

function addChartToPhase(db: Db, phaseId: string, body: Body) {
    const { chartId } = body;

    const phase = findPhase(db, phaseId);

    if (!phase) {
        fail(404, "Phase not found");
    }

    const chart = db.charts.find(c => c.id === chartId);

    if (!chart) {
        fail(404, "Chart not found");
    }

    if (chart.level < phase.minLevel) {
        fail(400, "Chart below minimum level");
    }

    if (!phase.allowOver && phase.maxLevel !== null && chart.level > phase.maxLevel) {
        fail(400, "Chart above maximum level");
    }

    if (db.phaseCharts.some(pc => pc.phaseId === phaseId && pc.chartId === chartId)) {
        fail(400, "Chart already added");
    }

    const phaseChart: PhaseChart = { id: newId(), phaseId, chartId };
    db.phaseCharts.push(phaseChart);

    return withChart(db, phaseChart);
}

function removeChartFromPhase(db: Db, phaseChartId: string) {
    if (!db.phaseCharts.some(pc => pc.id === phaseChartId)) {
        throw new Error("Record to delete does not exist");
    }

    db.phaseCharts = db.phaseCharts.filter(pc => pc.id !== phaseChartId);

    return { success: true };
}

function clearDrawHistory(db: Db, phaseId: string) {
    db.draws = db.draws.filter(draw => draw.phaseId !== phaseId);

    return { success: true };
}

// ---------- draws ----------

function drawCharts(db: Db, phaseId: string, body: Body) {
    const { amount } = body;

    const phase = findPhase(db, phaseId);

    if (!phase) {
        fail(404, "Phase not found");
    }

    const phaseDraws = db.draws.filter(draw => draw.phaseId === phaseId);
    const phaseCharts = phaseChartsOf(db, phaseId).map(pc => withChart(db, pc));

    const championship = championshipOfPhase(db, phaseId);

    if (!championship) {
        fail(400, "Phase not found in any championship");
    }

    if (championship.requiresActivation && !isActiveFor(championship, phaseId)) {
        fail(400, championship.phaseActivation ? "Phase is not the active phase" : "Category is not active");
    }

    const alreadyDrawnIds = phaseDraws.map(draw => draw.chartId);

    const availableCharts = phaseCharts.filter(
        phaseChart => !alreadyDrawnIds.includes(phaseChart.chartId)
    );

    if (availableCharts.length < amount) {
        fail(400, "Not enough charts available");
    }

    const drawnCharts: typeof availableCharts = [];
    const seed = randomHex(16);
    const now = Date.now();

    function record(selected: (typeof availableCharts)[number], index: number) {
        db.draws.push({
            id: newId(),
            round: phaseDraws.length + index + 1,
            seed,
            // ms distintos mantem a ordem "mais recente primeiro" deterministica
            createdAt: new Date(now + index).toISOString(),
            phaseId,
            chartId: selected.chartId
        });
    }

    if (championship.allowRepeats) {
        const pool = [...availableCharts];

        for (let i = 0; i < amount; i++) {
            const selected = pool[randomInt(0, pool.length)];

            pool.splice(pool.indexOf(selected), 1);
            drawnCharts.push(selected);
            record(selected, i);
        }
    } else {
        // Grupos por modo + nivel: S23 e D23 sao grupos diferentes (ex.: fases do Master)
        const chartsByLevel = new Map<string, typeof availableCharts>();

        for (const phaseChart of availableCharts) {
            const key = `${phaseChart.chart.mode}:${phaseChart.chart.level}`;
            const list = chartsByLevel.get(key) ?? [];
            list.push(phaseChart);
            chartsByLevel.set(key, list);
        }

        const levels = Array.from(chartsByLevel.keys());

        if (levels.length < amount) {
            fail(400, "Not enough distinct levels available");
        }

        for (let i = levels.length - 1; i > 0; i--) {
            const j = randomInt(0, i + 1);
            const temp = levels[i];
            levels[i] = levels[j];
            levels[j] = temp;
        }

        for (let i = 0; i < amount; i++) {
            const level = levels[randomInt(0, levels.length)];
            const levelCharts = chartsByLevel.get(level)!;
            const selected = levelCharts[randomInt(0, levelCharts.length)];

            drawnCharts.push(selected);
            chartsByLevel.delete(level);
            levels.splice(levels.indexOf(level), 1);
            record(selected, i);
        }
    }

    return {
        seed,
        draws: drawnCharts.map(item => drawSummary(item))
    };
}

function rerollChart(db: Db, phaseId: string, body: Body) {
    const level = Number(body.level);
    const mode: string | undefined =
        typeof body.mode === "string" && body.mode ? body.mode : undefined;

    const phase = findPhase(db, phaseId);

    if (!phase) {
        fail(404, "Phase not found");
    }

    const draws = sortedBy(
        db.draws.filter(draw => draw.phaseId === phaseId),
        (a, b) => a.round - b.round
    ).map(draw => withChartAndSong(db, draw));

    if (phase.order <= 1 || /final/i.test(phase.name)) {
        fail(400, "Reroll is only available after the first phase and before the final");
    }

    const championship = championshipOfPhase(db, phaseId);

    if (!championship) {
        fail(400, "Phase not found in any championship");
    }

    if (championship.requiresActivation && !isActiveFor(championship, phaseId)) {
        fail(400, championship.phaseActivation ? "Phase is not the active phase" : "Category is not active");
    }

    if (!Number.isInteger(level)) {
        fail(400, "A valid level is required");
    }

    // Sem `mode`, vale o modo da musica sorteada nesse nivel (S23 x D23 sao slots diferentes)
    const targetDraw = draws.find(
        draw => draw.chart.level === level && (mode === undefined || draw.chart.mode === mode)
    );
    const levelCharts = phaseChartsOf(db, phaseId)
        .map(pc => withChart(db, pc))
        .filter(pc => pc.chart.level === level && pc.chart.mode === targetDraw?.chart.mode);

    if (!targetDraw || levelCharts.length === 0) {
        fail(400, "The selected level is not available for reroll");
    }

    const selected = levelCharts[randomInt(0, levelCharts.length)];
    const seed = randomHex(16);

    const stored = db.draws.find(draw => draw.id === targetDraw.id)!;
    stored.chartId = selected.chartId;
    stored.seed = seed;

    const updated = sortedBy(
        db.draws.filter(draw => draw.phaseId === phaseId),
        (a, b) => a.round - b.round
    ).map(draw => withChartAndSong(db, draw));

    return {
        seed,
        rerollLevel: level,
        rerollMode: targetDraw.chart.mode,
        draws: updated.map(drawSummary)
    };
}

// ---------- songs ----------

function createSong(db: Db, body: Body) {
    const { title, bannerPath, charts } = body;

    const song: Song = {
        id: newId(),
        title,
        bannerPath,
        previewPath: null
    };

    const created: Chart[] = (charts as Body[]).map(chart => ({
        id: newId(),
        mode: chart.mode,
        level: chart.level,
        songId: song.id
    }));

    db.songs.push(song);
    db.charts.push(...created);

    return { ...song, charts: created };
}

function listSongs(db: Db) {
    return db.songs.map(song => ({
        ...song,
        charts: db.charts.filter(chart => chart.songId === song.id)
    }));
}

function listCharts(db: Db) {
    return sortedBy(db.charts, (a, b) => {
        if (a.mode !== b.mode) return a.mode < b.mode ? -1 : 1;
        return a.level - b.level;
    }).map(chart => withSong(db, chart));
}

function getBannerPool(db: Db) {
    return db.songs.map(song => ({ title: song.title, bannerPath: song.bannerPath }));
}

// ---------- display ----------

function getDisplay(db: Db) {
    const championship =
        db.championships.find(c => c.currentPhaseId !== null) ?? db.championships[0];

    if (!championship) {
        fail(404, "No championship");
    }

    const phases = db.phases.filter(phase => phase.championshipId === championship.id);

    const allPhases = phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        order: phase.order,
        drawCount: db.draws.filter(draw => draw.phaseId === phase.id).length
    }));

    let phase = null;

    const current = championship.currentPhaseId && findPhase(db, championship.currentPhaseId);

    if (current) {
        phase = {
            ...current,
            draws: db.draws
                .filter(draw => draw.phaseId === current.id)
                .map(draw => withChartAndSong(db, draw)),
            availableCharts: phaseChartsOf(db, current.id).map(pc => withChart(db, pc))
        };
    }

    // Categoria sem fases (ex.: Legends): o telao mostra os sorteios de todas as listas juntos
    if (phase && !championship.phaseActivation) {
        const lists = phases; // ja na ordem de insercao, como o backend (orderBy order)
        const ordered = sortedBy(lists, (a, b) => a.order - b.order);

        phase = {
            ...phase,
            name: championship.name,
            description: ordered.map(list => list.description).filter(Boolean).join(", ") || null,
            draws: latestDrawGroup(
                ordered.flatMap(list => db.draws.filter(draw => draw.phaseId === list.id)),
                championship.displayClearedAt ?? null
            ).map(draw => withChartAndSong(db, draw)),
            availableCharts: ordered.flatMap(list =>
                phaseChartsOf(db, list.id).map(pc => withChart(db, pc))
            )
        };
    }

    return {
        championship: {
            id: championship.id,
            name: championship.name,
            currentPhaseId: championship.currentPhaseId,
            phaseActivation: championship.phaseActivation
        },
        phase,
        allPhases
    };
}

function getConsolidatedPool(db: Db) {
    return sortedBy(db.championships, (a, b) => a.order - b.order).map(championship => ({
        id: championship.id,
        name: championship.name,
        currentPhaseId: championship.currentPhaseId,
        phases: sortedBy(
            db.phases.filter(phase => phase.championshipId === championship.id),
            (a, b) => a.order - b.order
        ).map(phase => ({
            id: phase.id,
            name: phase.name,
            mode: phase.mode,
            description: phase.description,
            minLevel: phase.minLevel,
            maxLevel: phase.maxLevel,
            allowOver: phase.allowOver,
            drawCount: phase.drawCount,
            charts: phaseChartsOf(db, phase.id)
                .map(pc => {
                    const { chart } = withChart(db, pc);

                    return {
                        id: chart.id,
                        mode: chart.mode,
                        level: chart.level,
                        title: chart.song.title,
                        bannerPath: chart.song.bannerPath,
                        previewPath: chart.song.previewPath
                    };
                })
        }))
    }));
}

// ---------- roteamento ----------

type Handler = (db: Db, params: string[], body: Body) => unknown;

const routes: { method: string; pattern: RegExp; handler: Handler }[] = [
    { method: "POST", pattern: /^\/championships$/, handler: (db, _p, body) => createChampionship(db, body) },
    { method: "GET", pattern: /^\/championships$/, handler: db => sortedBy(db.championships, (a, b) => a.order - b.order).map(c => withPhases(db, c)) },
    {
        method: "GET",
        pattern: /^\/championships\/([^/]+)$/,
        handler: (db, [id]) => {
            const championship = db.championships.find(c => c.id === id);
            return championship ? withPhases(db, championship) : fail(404, "Not found");
        }
    },
    { method: "DELETE", pattern: /^\/championships\/([^/]+)$/, handler: (db, [id]) => deleteChampionship(db, id) },
    { method: "PATCH", pattern: /^\/championships\/([^/]+)\/current-phase$/, handler: (db, [id], body) => setCurrentPhase(db, id, body) },
    { method: "POST", pattern: /^\/championships\/([^/]+)\/clear-display$/, handler: (db, [id]) => clearDisplay(db, id) },

    { method: "POST", pattern: /^\/songs$/, handler: (db, _p, body) => createSong(db, body) },
    { method: "GET", pattern: /^\/songs$/, handler: db => listSongs(db) },
    { method: "GET", pattern: /^\/songs\/charts$/, handler: db => listCharts(db) },
    { method: "GET", pattern: /^\/songs\/banner-pool$/, handler: db => getBannerPool(db) },

    { method: "POST", pattern: /^\/draws\/phase\/([^/]+)$/, handler: (db, [id], body) => drawCharts(db, id, body) },
    { method: "POST", pattern: /^\/draws\/phase\/([^/]+)\/reroll$/, handler: (db, [id], body) => rerollChart(db, id, body) },

    { method: "POST", pattern: /^\/phases\/([^/]+)\/charts$/, handler: (db, [id], body) => addChartToPhase(db, id, body) },
    { method: "GET", pattern: /^\/phases\/([^/]+)$/, handler: (db, [id]) => getPhase(db, id) },
    { method: "DELETE", pattern: /^\/phases\/charts\/([^/]+)$/, handler: (db, [id]) => removeChartFromPhase(db, id) },
    { method: "DELETE", pattern: /^\/phases\/([^/]+)\/history$/, handler: (db, [id]) => clearDrawHistory(db, id) },

    { method: "GET", pattern: /^\/display$/, handler: db => getDisplay(db) },
    { method: "GET", pattern: /^\/display\/pool$/, handler: db => getConsolidatedPool(db) }
];

function loadDb(store: Store, seed: Db): Db {
    const raw = store.read();

    if (raw) {
        try {
            return JSON.parse(raw) as Db;
        } catch {
            // dado corrompido: recomeca do seed
        }
    }

    const fresh = clone(seed);
    store.write(JSON.stringify(fresh));

    return fresh;
}

export function handle(
    method: string,
    url: string,
    body: unknown,
    store: Store,
    seed: Db
): EngineResponse {
    const path = url.split("?")[0].replace(/\/+$/, "") || "/";
    const verb = method.toUpperCase();

    const route = routes
        .map(r => ({ r, match: r.pattern.exec(path) }))
        .find(entry => entry.match && entry.r.method === verb);

    if (!route || !route.match) {
        return { status: 404, data: { error: "Not found" } };
    }

    const db = loadDb(store, seed);

    try {
        const data = route.r.handler(
            db,
            route.match.slice(1).map(decodeURIComponent),
            (body ?? {}) as Body
        );

        if (verb !== "GET") {
            store.write(JSON.stringify(db));
        }

        return { status: 200, data: clone(data) };
    } catch (error) {
        if (error instanceof HttpError) {
            return { status: error.status, data: { error: error.message } };
        }

        return { status: 500, data: { error: "Internal server error" } };
    }
}
