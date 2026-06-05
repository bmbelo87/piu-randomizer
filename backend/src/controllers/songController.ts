import { Request, Response } from "express";

import { prisma } from "../database/prisma";

export async function createSong(
    req: Request,
    res: Response
) {
    try {

        const { 
            title,
            bannerPath,
            charts
        } = req.body;
    
        const song = await prisma.song.create({
            data: {
                title,
                bannerPath,

                charts: {
                    create: charts
                }
            },

            include: {
                charts: true
            }
        });

        return res.json(song);
    
    } catch (error) {

        return res.status(500).json({
            error: "Internal server error"
        });

    }
}

export async function listSongs(
    req: Request,
    res: Response
) {
    try {

        const songs = await prisma.song.findMany({
            include: {
                charts: true
            }
        });

        return res.json(songs);
    
    } catch (error) {

        return res.status(500).json({
            error: "Internal server error"
        });
        
    }
}

export async function listCharts(
    req: Request,
    res: Response
) {
    try {

        const charts = 
            await prisma.chart.findMany({

                include: {
                    song:true
                },

                orderBy: [
                    {
                        mode: "asc"
                    },
                    {
                        level: "asc"
                    }
                ]
            });

        return res.json(charts);

    } catch {

        return res.status(500).json({
            error:
                "Internal server error"
        });
    }
}

export async function getBannerPool(
    req: Request,
    res: Response
) {
    const songs =
        await prisma.song.findMany({ 

            select: {
                title: true,
                bannerPath: true
            }
        });

    return res.json(
        songs
    );
}