import type { Championship, Phase } from "../types/championship";

export type PhaseState = "complete" | "active" | "pending";

export const LEGENDS_RANGE = "S22, S23, S24, D25, D26, D27";

export function getPhaseState(
    phases: Phase[],
    phase: Phase,
    currentPhaseId: string | null,
    phaseActivation = true
): PhaseState {
    if (!currentPhaseId) return "pending";

    // Categoria sem fases (ex.: Legends): categoria ativa = todas as listas liberadas
    if (!phaseActivation) return "active";

    const activeIndex = phases.findIndex(
        item => item.id === currentPhaseId
    );
    const phaseIndex = phases.findIndex(
        item => item.id === phase.id
    );

    if (phase.id === currentPhaseId) return "active";
    if (activeIndex >= 0 && phaseIndex < activeIndex) {
        return "complete";
    }
    return "pending";
}

export function phaseStateLabel(state: PhaseState) {
    if (state === "complete") return "CONCLUÍDA";
    if (state === "active") return "EM ANDAMENTO";
    return "PENDENTE";
}

export function phaseStateMark(state: PhaseState) {
    if (state === "complete") return "✓";
    if (state === "active") return "●";
    return "○";
}

export function phaseName(phase: Phase) {
    if (phase.mode === "X2") {
        if (/lower/i.test(phase.name)) return "LOW";
        if (/middle/i.test(phase.name)) return "MID";
        if (/upper/i.test(phase.name)) return "UP";
    }

    if (/final/i.test(phase.name)) return "FINAL";

    return phase.name
        .replace("a Fase", "ª FASE")
        .toUpperCase();
}

export function phaseDifficulty(phase: Phase) {
    if (phase.description) return phase.description;

    if (phase.mode === "X2") return phaseName(phase);

    const mode = phase.mode.replace(",", " + ");
    const max = phase.maxLevel == null
        ? "+"
        : `–${phase.maxLevel}`;

    return `${mode}${phase.minLevel}${max}`;
}

export function categoryRangeLabel(championship: Championship) {
    const name = championship.name.toLowerCase();

    if (name === "intermediate") return "S11–S17";
    if (name === "advanced") return "S15–S21";
    if (name === "expert single") return "S18–S24";
    if (name === "expert double") return "D19–D24";
    if (name === "master") return "S/D 21–26";
    if (name === "legends") return LEGENDS_RANGE;
    if (name === "co-op x2") return "LOW → MID → UP";
    if (name === "sem barra") return "S15–S22";

    const levels = championship.phases
        .map(phase => [phase.minLevel, phase.maxLevel ?? phase.minLevel])
        .flat();
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    return `${min}–${max}`;
}
