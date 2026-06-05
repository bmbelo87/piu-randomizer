export interface Phase {
    id: string;

    name: string;

    mode: string;

    minLevel: number;

    maxLevel?: number;

    drawCount: number;

    allowOver: boolean;
}

export interface Championship {
    id: string;

    name: string;

    phases: Phase[];
}