export interface Phase {
    id: string;
    name: string;
    mode: string;
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
                title: string;
                bannerPath: string;
                previewPath?: string;
            };
        };
    }[];
}