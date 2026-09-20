/**
 * Teste diferencial: roda o mesmo roteiro de chamadas contra o backend real
 * (rotas Express + Prisma, em uma COPIA temporaria do banco) e contra o motor
 * do modo estatico (frontend/src/static/engine.ts), e compara as respostas.
 *
 * Uso (dentro de backend/):
 *   npm run verify-static
 *
 * Ids e datas sao mascarados. Sorteios sao aleatorios, entao neles se compara
 * a forma da resposta e as regras (quantidade, niveis distintos, rounds, nivel do reroll).
 */
import fs from "fs";
import os from "os";
import path from "path";
import type { AddressInfo } from "net";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "piu-verify-"));
const tmpDb = path.join(tmpDir, "test.db");

fs.copyFileSync(path.resolve(__dirname, "../prisma/dev.db"), tmpDb);
process.env.DATABASE_URL = `file:${tmpDb}`;

const seedPath = path.resolve(__dirname, "../../frontend/src/static/seed.json");

type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Call = (
    method: string,
    url: string,
    body?: unknown
) => Promise<{ status: number; data: Json }>;

const startedAt = Date.now();
const ID = /^c[a-z0-9]{24}$/;

/** Mascara ids e datas novas para permitir comparacao exata. */
function mask(value: Json, key = ""): Json {
    if (Array.isArray(value)) return value.map(v => mask(v));

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, mask(v, k)])
        );
    }

    if (typeof value === "string") {
        if (ID.test(value)) return "<id>";
        if (key === "createdAt" && Date.parse(value) >= startedAt - 1000) return "<now>";
        if (key === "seed") return "<seed>";
    }

    return value;
}

/** So a forma: chaves e tipos, sem valores. */
function shape(value: Json): Json {
    if (Array.isArray(value)) return value.length ? [shape(value[0])] : [];
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
    }
    return value === null ? "null" : typeof value;
}

async function scenario(call: Call) {
    const log: { step: string; status: number; data: Json; kind: "exact" | "shape" | "status" }[] = [];
    const checks: string[] = [];

    async function step(
        name: string,
        method: string,
        url: string,
        body?: unknown,
        kind: "exact" | "shape" | "status" = "exact"
    ) {
        const result = await call(method, url, body);
        log.push({ step: name, status: result.status, data: result.data, kind });
        return result;
    }

    const list = (await step("list championships", "GET", "/championships")).data as Json[];
    const champion = list.find(c => c.requiresActivation && !c.allowRepeats && c.phases.length >= 2)!;
    const phases = [...champion.phases].sort((a: Json, b: Json) => a.order - b.order);
    const [p1, p2] = phases;

    await step("get championship", "GET", `/championships/${champion.id}`);
    await step("get championship 404", "GET", "/championships/nope");
    await step("get phase", "GET", `/phases/${p2.id}`);
    await step("get phase 404", "GET", "/phases/nope");
    await step("songs", "GET", "/songs");
    const charts = (await step("charts", "GET", "/songs/charts")).data as Json[];
    await step("banner pool", "GET", "/songs/banner-pool");
    await step("display (nothing active)", "GET", "/display");
    await step("display pool", "GET", "/display/pool");
    await step("unknown route", "GET", "/nope", undefined, "status");

    await step("draw on inactive phase", "POST", `/draws/phase/${p2.id}`, { amount: p2.drawCount });
    await step("draw missing phase", "POST", "/draws/phase/nope", { amount: 2 });
    await step("activate", "PATCH", `/championships/${champion.id}/current-phase`, { phaseId: p2.id });
    await step("display (active, no draws)", "GET", "/display");

    const drawn = await step("draw", "POST", `/draws/phase/${p2.id}`, { amount: p2.drawCount }, "shape");
    const drawnLevels = drawn.data.draws.map((d: Json) => d.level);
    checks.push(`draw count=${drawn.data.draws.length}`);
    checks.push(`draw distinct levels=${new Set(drawnLevels).size === drawnLevels.length}`);
    checks.push(`draw seed length=${drawn.data.seed.length}`);

    const afterDraw = await step("phase after draw", "GET", `/phases/${p2.id}`, undefined, "shape");
    checks.push(`draws stored=${afterDraw.data.draws.length}`);
    checks.push(`draw rounds=${afterDraw.data.draws.map((d: Json) => d.round).sort().join(",")}`);
    await step("display after draw", "GET", "/display", undefined, "shape");

    await step("too many", "POST", `/draws/phase/${p2.id}`, { amount: 9999 });

    const rerollLevel = drawnLevels[0];
    const rerolled = await step("reroll", "POST", `/draws/phase/${p2.id}/reroll`, { level: rerollLevel }, "shape");
    checks.push(`reroll level=${rerolled.data.rerollLevel === rerollLevel}`);
    checks.push(`reroll draws=${rerolled.data.draws.length}`);
    checks.push(`reroll keeps levels=${rerolled.data.draws.map((d: Json) => d.level).sort().join(",") === [...drawnLevels].sort().join(",")}`);
    await step("reroll bad level", "POST", `/draws/phase/${p2.id}/reroll`, { level: "x" });
    await step("reroll unknown level", "POST", `/draws/phase/${p2.id}/reroll`, { level: 999 });
    await step("reroll first phase", "POST", `/draws/phase/${p1.id}/reroll`, { level: 1 });

    await step("clear history", "DELETE", `/phases/${p2.id}/history`);
    await step("phase after clear", "GET", `/phases/${p2.id}`);

    const inPhase = new Set(
        ((await call("GET", `/phases/${p2.id}`)).data.availableCharts as Json[]).map(pc => pc.chartId)
    );
    const addable = charts.find(
        c => !inPhase.has(c.id) && c.level >= p2.minLevel && (p2.allowOver || p2.maxLevel === null || c.level <= p2.maxLevel)
    )!;
    const tooLow = charts.find(c => c.level < p2.minLevel);
    const added = await step("add chart", "POST", `/phases/${p2.id}/charts`, { chartId: addable.id });
    await step("add chart twice", "POST", `/phases/${p2.id}/charts`, { chartId: addable.id });
    if (tooLow) await step("add chart too low", "POST", `/phases/${p2.id}/charts`, { chartId: tooLow.id });
    await step("add chart unknown", "POST", `/phases/${p2.id}/charts`, { chartId: "nope" });
    await step("add chart bad phase", "POST", "/phases/nope/charts", { chartId: addable.id });
    await step("remove chart", "DELETE", `/phases/charts/${added.data.id}`);
    await step("remove chart again", "DELETE", `/phases/charts/${added.data.id}`);
    await step("pool", "GET", "/display/pool");

    await step("deactivate", "PATCH", `/championships/${champion.id}/current-phase`, { phaseId: null });
    await step("display (deactivated)", "GET", "/display");

    const created = await step("create championship", "POST", "/championships", {
        name: "Teste",
        allowRepeats: true,
        requiresActivation: false,
        phases: [
            { name: "Classificatoria", mode: "S", minLevel: 10, maxLevel: 20, drawCount: 3 },
            { name: "Final", mode: "D", minLevel: 12, maxLevel: null, allowOver: true }
        ]
    });
    const newPhases = created.data.phases as Json[];
    await step("list after create", "GET", "/championships");
    await step("activate new (2nd champ deactivates others)", "PATCH", `/championships/${champion.id}/current-phase`, { phaseId: p1.id });
    await step("activate new championship", "PATCH", `/championships/${created.data.id}/current-phase`, { phaseId: newPhases[0].id });
    await step("list after activate", "GET", "/championships");

    // allowRepeats + sem ativacao: qualquer fase sorteia
    const lowCharts = charts.filter(c => c.mode === "S" && c.level >= 10 && c.level <= 20).slice(0, 8);
    for (const chart of lowCharts) {
        await call("POST", `/phases/${newPhases[0].id}/charts`, { chartId: chart.id });
    }
    const repeatDraw = await step("draw allowRepeats", "POST", `/draws/phase/${newPhases[0].id}`, { amount: 3 }, "shape");
    checks.push(`repeat draw count=${repeatDraw.data.draws.length}`);
    await step("draw allowRepeats again", "POST", `/draws/phase/${newPhases[0].id}`, { amount: 3 }, "shape");
    const repeatPhase = await step("phase after repeat draws", "GET", `/phases/${newPhases[0].id}`, undefined, "shape");
    checks.push(`repeat draws stored=${repeatPhase.data.draws.length}`);
    checks.push(`repeat rounds=${repeatPhase.data.draws.map((d: Json) => d.round).sort().join(",")}`);

    await step("delete championship", "DELETE", `/championships/${created.data.id}`);
    await step("get deleted championship", "GET", `/championships/${created.data.id}`);
    await step("delete again", "DELETE", `/championships/${created.data.id}`);
    await step("phase of deleted", "GET", `/phases/${newPhases[0].id}`);

    const song = await step("create song", "POST", "/songs", {
        title: "Nova",
        bannerPath: "nova.png",
        charts: [{ mode: "S", level: 5 }, { mode: "D", level: 6 }]
    });
    checks.push(`song charts=${song.data.charts.length}`);
    await step("songs after create", "GET", "/songs/banner-pool");

    return { log, checks };
}

/** O front e ESM e o backend CommonJS: transpila o engine.ts para uma copia temporaria. */
function loadEngine(): (
    method: string,
    url: string,
    body: unknown,
    store: { read(): string | null; write(value: string): void },
    seed: unknown
) => { status: number; data: unknown } {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ts = require("typescript");
    const source = fs.readFileSync(
        path.resolve(__dirname, "../../frontend/src/static/engine.ts"),
        "utf8"
    );
    const output = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText;
    const file = path.join(tmpDir, "engine.cjs");

    fs.writeFileSync(file, output);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(file).handle;
}

async function main() {
    // Backend real, em cima da copia do banco. Imports dinamicos: precisam
    // vir depois de DATABASE_URL.
    const { prisma } = await import("../src/database/prisma");
    const express = (await import("express")).default;
    const { default: championshipRoutes } = await import("../src/routes/championshipRoutes");
    const { default: songRoutes } = await import("../src/routes/songRoutes");
    const { default: phaseRoutes } = await import("../src/routes/phaseRoutes");
    const { default: drawRoutes } = await import("../src/routes/drawRoutes");
    const { default: displayRoutes } = await import("../src/routes/displayRoutes");
    const handle = loadEngine();

    // Estado inicial igual ao seed: sem sorteios e sem fase ativa.
    await prisma.draw.deleteMany();
    await prisma.championship.updateMany({ data: { currentPhaseId: null } });

    const app = express();
    app.use(express.json());
    app.use("/championships", championshipRoutes);
    app.use("/songs", songRoutes);
    app.use("/phases", phaseRoutes);
    app.use("/draws", drawRoutes);
    app.use("/display", displayRoutes);

    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;

    const backendCall: Call = async (method, url, body) => {
        const response = await fetch(`http://localhost:${port}${url}`, {
            method,
            headers: { "content-type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        const text = await response.text();
        let data: Json = text;
        try { data = JSON.parse(text); } catch { /* corpo nao-JSON (ex.: 404 do express) */ }
        return { status: response.status, data };
    };

    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    let memory: string | null = null;
    const store = {
        read: () => memory,
        write: (value: string) => { memory = value; }
    };

    const engineCall: Call = async (method, url, body) => {
        const raw = body === undefined ? undefined : JSON.parse(JSON.stringify(body));
        return handle(method, url, raw, store, seed) as { status: number; data: Json };
    };

    const backend = await scenario(backendCall);
    const engine = await scenario(engineCall);

    server.close();
    await prisma.$disconnect();

    let failures = 0;

    backend.log.forEach((expected, index) => {
        const actual = engine.log[index];
        const same = (v: Json) =>
            expected.kind === "status"
                ? ""
                : JSON.stringify(expected.kind === "exact" ? mask(v) : shape(v));
        const ok =
            actual.step === expected.step &&
            actual.status === expected.status &&
            same(actual.data) === same(expected.data);

        if (!ok) {
            failures++;
            console.log(`\nDIFERENTE  ${expected.step} (${expected.kind})`);
            const a = same(expected.data);
            const b = same(actual.data);
            let at = 0;
            while (at < a.length && a[at] === b[at]) at++;
            const from = Math.max(0, at - 150);
            console.log("  status:", expected.status, "vs", actual.status);
            console.log("  backend: ...", a.slice(from, at + 250));
            console.log("  estatico:...", b.slice(from, at + 250));
        }
    });

    if (JSON.stringify(backend.checks) !== JSON.stringify(engine.checks)) {
        failures++;
        console.log("\nDIFERENTE  regras dos sorteios");
        console.log("  backend: ", backend.checks.join(" | "));
        console.log("  estatico:", engine.checks.join(" | "));
    }

    console.log(`\n${backend.log.length} chamadas comparadas, ${failures} diferenca(s).`);
    console.log("Regras verificadas:", engine.checks.join(" | "));

    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(failures ? 1 : 0);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
