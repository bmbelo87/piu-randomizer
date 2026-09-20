import type { Phase } from "./phase";

export interface PhaseSummary {
    id: string;
    name: string;
    order: number;
    drawCount: number;
}

export interface DisplayData {

    championship: {
        id: string;
        name: string;
        currentPhaseId: string | null;
        phaseActivation?: boolean;
    };

    phase: Phase | null;

    allPhases: PhaseSummary[];
}