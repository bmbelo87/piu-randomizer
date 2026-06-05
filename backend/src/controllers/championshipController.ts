import { Request, Response } from "express";

import { prisma } from "../database/prisma";

export async function createChampionship(
    req: Request,
    res: Response
) {
    try {
        const {name, phases } = req.body;

        const championship = await prisma.championship.create({
            data: {
                name, 
                ownerId: (req as any).userId,

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
            where: {
                ownerId: (req as any).userId
            },

            include: {
                phases: true
            }
        });

        return res.json(championships);

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
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

            allowOver: phase.allowOver ?? false
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
