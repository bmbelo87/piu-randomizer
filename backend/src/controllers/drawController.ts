import { Request, Response } from "express";

import crypto from "crypto";

import { prisma } from "../database/prisma";

/**
 * Categoria com ativacao por fase: so a fase ativa sorteia.
 * Categoria sem fases (phaseActivation = false, ex.: Legends): basta a categoria estar ativa.
 */
function isActiveFor(
    championship: { phaseActivation: boolean; currentPhaseId: string | null },
    phaseId: string
) {
    return championship.phaseActivation
        ? championship.currentPhaseId === phaseId
        : championship.currentPhaseId !== null;
}

export async function drawCharts(
    req: Request,
    res: Response
) { 
    try {

        const phaseId = 
        req.params.id as string;

        const {
            amount
        } = req.body;

        const phase = 
        await prisma.phase.findUnique({
            where: {
                id: phaseId
            },

            include: {
                availableCharts: {
                    include: {
                        chart: {
                            include: {
                                song: true
                            }
                        }
                    }
                },

                draws: true
            }
        });

        if (!phase) {
            return res.status(404).json({
                error: "Phase not found"
            });
        }

        const championship =
            await prisma.championship.findFirst({
                where: {
                    phases: {
                        some: {
                            id: phaseId
                        }
                    }
                }
            });

        if (!championship) {
            return res.status(400).json({
                error:
                    "Phase not found in any championship"
            });
        }

        if (
            championship.requiresActivation &&
            !isActiveFor(championship, phaseId)
        ) {
            return res.status(400).json({
                error:
                    championship.phaseActivation
                        ? "Phase is not the active phase"
                        : "Category is not active"
            });
        }

        const alreadyDrawnIds = 
        phase.draws.map(
            draw => draw.chartId
        );

        const availableCharts = 
        phase.availableCharts.filter(
            phaseChart =>
                !alreadyDrawnIds.includes(
                    phaseChart.chartId
                )
        );

        if (
            availableCharts.length < amount
        ) { 
            return res.status(400).json({
                error: "Not enough charts available"
            });
        }

        const drawnCharts = [];

        const seed =
        crypto.randomBytes(16)
        .toString("hex");

        if (
            championship.allowRepeats
        ) {
            const pool = [ ...availableCharts ];

            for (let i = 0; i < amount; i++ ) {
                const randomIndex =
                    crypto.randomInt(
                        0,
                        pool.length
                    );

                const selected =
                    pool[randomIndex];

                pool.splice(
                    pool.indexOf(selected),
                    1
                );

                drawnCharts.push(selected);

                await prisma.draw.create({
                    data: {

                        round:
                            phase.draws.length + i + 1,

                        seed,

                        phaseId,

                        chartId:
                            selected.chartId
                    }
                });
            }
        } else {
            // Grupos por modo + nivel: S23 e D23 sao grupos diferentes (ex.: fases do Master)
            const chartsByLevel =
                new Map<string, typeof availableCharts>();

            for (
                const phaseChart
                of availableCharts
            ) {
                const level =
                    `${phaseChart.chart.mode}:${phaseChart.chart.level}`;

                const list =
                    chartsByLevel.get(level) ?? [];

                list.push(phaseChart);

                chartsByLevel.set(
                    level,
                    list
                );
            }

            const levels =
                Array.from(
                    chartsByLevel.keys()
                );

            if (
                levels.length < amount
            ) {
                return res.status(400).json({
                    error: "Not enough distinct levels available"
                });
            }

            for (let i = levels.length - 1; i > 0; i--) {
                const j =
                    crypto.randomInt(0, i + 1);

                const temp = levels[i];
                levels[i] = levels[j];
                levels[j] = temp;
            }

            for (let i = 0; i < amount; i++ )
            {
                const level =
                    levels[
                        crypto.randomInt(
                            0,
                            levels.length
                        )
                    ];

                const levelCharts =
                    chartsByLevel.get(level)!;

                const randomIndex =
                    crypto.randomInt(
                        0,
                        levelCharts.length
                    );

                const selected =
                    levelCharts[randomIndex];

                drawnCharts.push(selected);

                chartsByLevel.delete(level);

                levels.splice(
                    levels.indexOf(level),
                    1
                );

                await prisma.draw.create({
                    data: {

                        round:
                            phase.draws.length + i + 1,

                        seed,

                        phaseId,

                        chartId:
                            selected.chartId
                    }
                });
            }
        }

        return res.json({
            seed,

            draws:
            drawnCharts.map(
                item=>({
                    song:
                    item.chart.song.title,

                    bannerPath:
                        item.chart.song.bannerPath,

                    previewPath:
                        item.chart.song.previewPath ?? null,

                    mode:
                    item.chart.mode,

                    level:
                    item.chart.level
                })
            )
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
        
    }
}

export async function rerollChart(
    req: Request,
    res: Response
) {
    try {
        const phaseId = req.params.id as string;
        const level = Number(req.body.level);
        const mode: string | undefined =
            typeof req.body.mode === "string" && req.body.mode
                ? req.body.mode
                : undefined;

        const phase = await prisma.phase.findUnique({
            where: { id: phaseId },
            include: {
                availableCharts: {
                    include: {
                        chart: {
                            include: { song: true }
                        }
                    }
                },
                draws: {
                    include: {
                        chart: {
                            include: { song: true }
                        }
                    },
                    orderBy: { round: "asc" }
                }
            }
        });

        if (!phase) {
            return res.status(404).json({ error: "Phase not found" });
        }

        if (phase.order <= 1 || /final/i.test(phase.name)) {
            return res.status(400).json({
                error: "Reroll is only available after the first phase and before the final"
            });
        }

        const championship = await prisma.championship.findFirst({
            where: { phases: { some: { id: phaseId } } }
        });

        if (!championship) {
            return res.status(400).json({
                error: "Phase not found in any championship"
            });
        }

        if (
            championship.requiresActivation &&
            !isActiveFor(championship, phaseId)
        ) {
            return res.status(400).json({
                error: championship.phaseActivation
                    ? "Phase is not the active phase"
                    : "Category is not active"
            });
        }

        if (!Number.isInteger(level)) {
            return res.status(400).json({ error: "A valid level is required" });
        }

        // Sem `mode`, vale o modo da musica sorteada nesse nivel (S23 x D23 sao slots diferentes)
        const targetDraw = phase.draws.find(
            draw =>
                draw.chart.level === level &&
                (mode === undefined || draw.chart.mode === mode)
        );
        const levelCharts = phase.availableCharts.filter(
            phaseChart =>
                phaseChart.chart.level === level &&
                phaseChart.chart.mode === targetDraw?.chart.mode
        );

        if (!targetDraw || levelCharts.length === 0) {
            return res.status(400).json({
                error: "The selected level is not available for reroll"
            });
        }

        const selected =
            levelCharts[crypto.randomInt(0, levelCharts.length)];
        const seed = crypto.randomBytes(16).toString("hex");

        await prisma.draw.update({
            where: { id: targetDraw.id },
            data: {
                chartId: selected.chartId,
                seed
            }
        });

        const draws = await prisma.draw.findMany({
            where: { phaseId },
            include: {
                chart: {
                    include: { song: true }
                }
            },
            orderBy: { round: "asc" }
        });

        return res.json({
            seed,
            rerollLevel: level,
            rerollMode: targetDraw.chart.mode,
            draws: draws.map(draw => ({
                song: draw.chart.song.title,
                bannerPath: draw.chart.song.bannerPath,
                previewPath: draw.chart.song.previewPath ?? null,
                mode: draw.chart.mode,
                level: draw.chart.level
            }))
        });
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
}
