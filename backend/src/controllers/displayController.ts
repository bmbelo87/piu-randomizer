import {
    Request,
    Response
}
from "express";

import {
    prisma
}
from "../database/prisma";

function latestDrawGroup<
    T extends { seed: string; createdAt: Date }
>(
    draws: T[],
    clearedAt: Date | null
) {
    let latest: T | undefined;

    for (const draw of draws) {
        if (!latest || draw.createdAt >= latest.createdAt) {
            latest = draw;
        }
    }

    if (!latest || (clearedAt && latest.createdAt <= clearedAt)) {
        return [];
    }

    // sorteios da mesma chamada compartilham a seed
    return draws.filter(
        draw => draw.seed === latest.seed
    );
}

export async function getDisplay(
    req: Request,
    res: Response
) {

    try {

        let championship =
            await prisma.championship.findFirst({

                where: {
                    currentPhaseId: {
                        not: null
                    }
                },

                include: {

                    phases: {
                        include: {
                            draws: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });

        if (!championship) {

            championship =
                await prisma.championship.findFirst({

                    include: {

                        phases: {
                            include: {
                                draws: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                });
        }
        
        if (!championship) {
            return res.status(404).json({

                error:
                    "No championship"
            });
        }

        const allPhases =
            championship.phases.map(
                p => ({
                    id: p.id,
                    name: p.name,
                    order: p.order,
                    drawCount:
                        p.draws.length
                })
            );

        let phase = null;

        if (
            championship.currentPhaseId
        ) {

            phase =
                await prisma.phase.findUnique({

                    where: {

                        id: 
                            championship
                                .currentPhaseId
                    },

                    include: {
                        draws: {
                            include: {
                                chart: {
                                    include: {
                                        song: true
                                    }
                                }
                            }
                        },

                        availableCharts: {
                            include: {
                                chart: {
                                    include: {
                                        song: true
                                    }
                                }
                            }
                        }
                    }
                });
        }

        // Categoria sem fases (ex.: Legends): o telao mostra os sorteios de todas as listas juntos
        if (phase && !championship.phaseActivation) {
            const lists =
                await prisma.phase.findMany({
                    where: {
                        championshipId:
                            championship.id
                    },

                    orderBy: {
                        order: "asc"
                    },

                    include: {
                        draws: {
                            include: {
                                chart: {
                                    include: {
                                        song: true
                                    }
                                }
                            }
                        },

                        availableCharts: {
                            include: {
                                chart: {
                                    include: {
                                        song: true
                                    }
                                }
                            }
                        }
                    }
                });

            phase = {
                ...phase,

                name:
                    championship.name,

                description:
                    lists
                        .map(list => list.description)
                        .filter(Boolean)
                        .join(", ") || null,

                // Uma musica por vez: so o ultimo sorteio, e so se veio depois de "limpar display"
                draws:
                    latestDrawGroup(
                        lists.flatMap(list => list.draws),
                        championship.displayClearedAt
                    ),

                availableCharts:
                    lists.flatMap(
                        list => list.availableCharts
                    )
            };
        }

        return res.json({
            championship: {

                id: 
                    championship.id,

                name:
                    championship.name,

                currentPhaseId:
                    championship
                        .currentPhaseId,

                phaseActivation:
                    championship
                        .phaseActivation
            },

            phase,
            allPhases
        });
    } catch {
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}

export async function getConsolidatedPool(
    req: Request,
    res: Response
) {
    try {

        const championships =
            await prisma.championship.findMany({

                orderBy: {
                    order: "asc"
                },

                include: {

                    phases: {

                        orderBy: {
                            order: "asc"
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
                            }
                        }
                    }
                }
            });

        const pool = championships.map(
            championship => ({
                id: championship.id,
                name: championship.name,
                currentPhaseId:
                    championship.currentPhaseId,
                phases: championship.phases.map(
                    phase => ({
                        id: phase.id,
                        name: phase.name,
                        mode: phase.mode,
                        description: phase.description,
                        minLevel: phase.minLevel,
                        maxLevel: phase.maxLevel,
                        allowOver: phase.allowOver,
                        drawCount: phase.drawCount,
                        charts: phase.availableCharts.map(
                            phaseChart => ({
                                id: phaseChart.chart.id,
                                mode: phaseChart.chart.mode,
                                level: phaseChart.chart.level,
                                title:
                                    phaseChart.chart.song.title,
                                bannerPath:
                                    phaseChart.chart.song.bannerPath,
                                previewPath:
                                    phaseChart.chart.song.previewPath
                            })
                        )
                    })
                )
            })
        );

        return res.json(pool);

    } catch {
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}