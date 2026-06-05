import { Request, Response } from "express";

import { prisma } from "../database/prisma";

export async function addChartToPhase(
    req: Request,
    res: Response
) {
    try {
        const phaseId = req.params.id as string;

        const { 
            chartId
        } = req.body;

        const phase = await prisma.phase.findUnique({
            where: {
                id: phaseId
            }
        });

        if (!phase) {
            return res.status(404).json({
                error: "Phase not found"
            });
        }

        const chart = await prisma.chart.findUnique({
            where: {
                id: chartId
            },

            include: {
                song: true
            }
        });

        if (!chart) {
            return res.status(404).json({
                error: "Chart not found"
            });
        }

        if (chart.level < phase.minLevel) {
            return res.status(400).json({
                error: "Chart below minimum level"
            });
        }

        if (
            !phase.allowOver &&
            phase.maxLevel !== null &&
            chart.level > phase.maxLevel
        ) {
            return res.status(400).json({
                error: "Chart above maximum level"
            });
        }

        const exists = 
            await prisma.phaseChart.findFirst({
                where: {
                    phaseId,
                    chartId: chartId as string
                }
            });

            if (exists) {
                return res.status(400).json({
                    error: "Chart already added"
                });
            }

        const phaseChart = 
            await prisma.phaseChart.create({
                data: {
                    phaseId,
                    chartId: chartId as string
                },

                include: {
                    chart: {
                        include: {
                            song: true
                        }
                    }
                }
            });
            
        return res.json(phaseChart);
    
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });

    }
}

export async function getPhase(
    req: Request,
    res: Response
) {

    try {

        const phaseId = 
            req.params.id as string;

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
                                song:true
                            }
                        }
                    }
                },

                draws: {
                    include: {

                        chart: {

                            include: {
                                song: true
                            }
                        }
                    },

                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        if (!phase) {

            return res.status(404).json({
                error: "Phase not found"
            });
        }

        return res.json(
            phase
        );

    } catch {

        return res.status(500).json({
            error:
            "Internal server error"
        });
    }
}

export async function removeChartFromPhase(
    req: Request,
    res: Response
) {

    try {

        const phaseChartId = 
            req.params.phaseChartId as string;

        await prisma.phaseChart.delete({

            where: {
                id: phaseChartId
            }
        });

        return res.json({
            success: true
        });

    } catch {
        return res.status(500).json({
            error: 
                "Internal server error"
        });
    }
}

export async function clearDrawHistory(
    req: Request,
    res: Response
) {

    try {

        const phaseId = 
            req.params.phaseId as string;

        await prisma.draw.deleteMany({

            where: {
                phaseId
            }
        });

        return res.json({
            success: true
        });
    } catch {
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}