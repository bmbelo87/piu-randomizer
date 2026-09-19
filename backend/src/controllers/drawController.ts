import { Request, Response } from "express";

import crypto from "crypto";

import { prisma } from "../database/prisma";

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
            championship.currentPhaseId !== phaseId
        ) {
            return res.status(400).json({
                error:
                    "Phase is not the active phase"
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
            const chartsByLevel =
                new Map<number, typeof availableCharts>();

            for (
                const phaseChart
                of availableCharts
            ) {
                const level =
                    phaseChart.chart.level;

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
