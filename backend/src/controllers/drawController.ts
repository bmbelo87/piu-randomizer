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

        for ( let i = 0; i < amount; i++ )
        {
            const randomIndex = crypto.randomInt(0, availableCharts.length);
            
            const selected = availableCharts[randomIndex];

            drawnCharts.push(selected);

            availableCharts.splice(randomIndex, 1);

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

        return res.json({
            seed,

            draws:
            drawnCharts.map(
                item=>({
                    song:
                    item.chart.song.title,

                    bannerPath:
                        item.chart.song.bannerPath,

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