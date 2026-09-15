export interface Phase {
    id: string;

    name: string;

    order: number;

    mode: string;

    minLevel: number;

    maxLevel?: number;

    drawCount: number;

    allowOver: boolean;
}

export interface Championship {
    id: string;

    name: string;

    currentPhaseId: string | null;

    phases: Phase[];
}