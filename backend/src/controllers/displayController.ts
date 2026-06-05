import {
    Request,
    Response
}
from "express";

import {
    prisma
}
from "../database/prisma";

export async function getDisplay(
    req: Request,
    res: Response
) {

    try {

        const championship =
            await prisma.championship.findFirst({

                where: {

                    currentPhaseId: {
                        not: null
                    }
                },

                include: {

                    phases: true
                }
            });
        
        if (!championship) {
            return res.status(404).json({

                error:
                    "No active championship"
            });
        }

        const phase =
            await prisma.phase.findUnique({

                where: {

                    id: 
                        championship.currentPhaseId!
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

        return res.json({
            championship: {

                id: 
                    championship.id,

                name:
                    championship.name
            },

            phase
        });
    } catch {
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}