export interface Phase {
    id: string;
    name: string;
    order: number;
    championshipId: string;
    mode: string;
    description?: string | null;
    minLevel: number;
    maxLevel: number | null;
    allowOver: boolean;
    drawCount: number;

    availableCharts: {
        id: string;

        chart:{
            id: string;
            mode: string;
            level: number;

            song: {
                id: string;
                title: string;
                bannerPath: string;
                previewPath?: string;
            };
        };
    }[];

    draws: {
        id: string;
        seed: string;
        round: number;

        chart: {
            id: string;
            mode: string;
            level: number;

            song: {
                id: string;
                title: string;
                bannerPath: string;
                previewPath?: string;
            };
        };
    }[];
}
