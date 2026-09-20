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

    // false = so a categoria e ativada (sem ativar fase), ex.: Legends
    phaseActivation?: boolean;

    currentPhaseId: string | null;

    phases: Phase[];
}
