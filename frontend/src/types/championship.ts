export interface Phase {
    id: string;

    name: string;

    order: number;

    mode: string;

    description?: string | null;

    minLevel: number;

    maxLevel?: number | null;

    drawCount: number;

    allowOver: boolean;
}

export interface Championship {
    id: string;

    name: string;

    allowRepeats: boolean;

    requiresActivation: boolean;

    currentPhaseId: string | null;

    phases: Phase[];
}
