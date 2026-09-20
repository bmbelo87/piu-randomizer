import { Request, Response } from "express";

import { prisma } from "../database/prisma";

export async function createChampionship(
    req: Request,
    res: Response
) {
    try {
        const {name, phases, allowRepeats, requiresActivation, phaseActivation } = req.body;

        const championship = await prisma.championship.create({
            data: {
                name, 

                allowRepeats:
                    allowRepeats ?? false,

                requiresActivation:
                    requiresActivation ?? true,

                phaseActivation:
                    phaseActivation ?? true,

                order:
                    (await getNextOrder()),

                phases: {
                    create: generatePhases(phases)
                }
            },

            include: {
                phases: true
            }
        });

        return res.json(championship);

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

export async function listChampionships(req: Request, res: Response) {
    try {
        const championships = 
        await prisma.championship.findMany({
            include: {
                phases: true
            },

            orderBy: {
                order: "asc"
            }
        });

        return res.json(championships);

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function getNextOrder() {
    const aggregate =
        await prisma.championship.aggregate({
            _max: {
                order: true
            }
        });

    return (aggregate._max.order ?? -1) + 1;
}

function generatePhases(phases: any[]) {
    return phases.map(
        (phase:any, index: number) => ({
            name: phase.name,
            order: index + 1,

            mode: phase.mode,

            minLevel: phase.minLevel,
            maxLevel: phase.maxLevel,

            drawCount: 
                phase.drawCount ?? 2,

            allowOver: phase.allowOver ?? false,

            description: phase.description ?? null
        })
    );
}

export async function getChampionship(
    req: Request,
    res: Response
) {

    try {

        const id = 
            req.params.id as string;

        const championship = 
        await prisma.championship.findUnique({

            where: {
                id
            },

            include: {
                phases: true
            }
        });

        if (!championship) {
            
            return res.status(404).json({
                error: "Not found"
            });
        }

        return res.json(
            championship
        );
    
    } catch {

        return res.status(500).json({
            error:
            "Internal server error"
        });
    } 
}

export async function deleteChampionship(
    req: Request,
    res: Response
) {

    try {

        const id =
            req.params.id as string;

        await prisma.championship.delete({
            where: {
                id
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

export async function setCurrentPhase(
    req: Request,
    res: Response
) {

    try {
        const championshipId =
            req.params.id as string;

        const {
            phaseId
        } = req.body;

        if (phaseId) {

            await prisma.championship.updateMany(
                {
                    where: {
                        id: {
                            not: championshipId
                        },
                        currentPhaseId: {
                            not: null
                        }
                    },
                    data: {
                        currentPhaseId: null
                    }
                }
            );
        }

        const championship =
            await prisma.championship.update({

                where: {
                    id: championshipId
                },

                data: {
                    currentPhaseId: phaseId
                }
            });
        return res.json(
            championship
        );
    } catch {
        
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}


/**
 * Limpa o telao sem apagar o historico: o display so passa a mostrar
 * sorteios feitos a partir de agora.
 */
export async function clearDisplay(
    req: Request,
    res: Response
) {
    try {
        const championship =
            await prisma.championship.update({
                where: {
                    id: req.params.id as string
                },

                data: {
                    displayClearedAt: new Date()
                }
            });

        return res.json(
            championship
        );
    } catch {
        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}
