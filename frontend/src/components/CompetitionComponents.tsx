import type { Championship, Phase } from "../types/championship";
import {
    LEGENDS_RANGE,
    categoryRangeLabel,
    getPhaseState,
    phaseDifficulty,
    phaseName,
    phaseStateLabel,
    phaseStateMark
} from "../utils/competitionUtils";
import type { PhaseState } from "../utils/competitionUtils";
import sBackground from "../assets/stepballs/s_bg.png";
import cIcon from "../assets/stepballs/c_icon.png";
import cBackground from "../assets/stepballs/c_bg.png";
import dBackground from "../assets/stepballs/d_bg.png";
import sText from "../assets/stepballs/s_text.png";
import cText from "../assets/stepballs/c_text.png";
import dText from "../assets/stepballs/d_text.png";
import number0 from "../assets/stepballs/s_num_0.png";
import number1 from "../assets/stepballs/s_num_1.png";
import number2 from "../assets/stepballs/s_num_2.png";
import number3 from "../assets/stepballs/s_num_3.png";
import number4 from "../assets/stepballs/s_num_4.png";
import number5 from "../assets/stepballs/s_num_5.png";
import number6 from "../assets/stepballs/s_num_6.png";
import number7 from "../assets/stepballs/s_num_7.png";
import number8 from "../assets/stepballs/s_num_8.png";
import number9 from "../assets/stepballs/s_num_9.png";

const numberImages = [
    number0,
    number1,
    number2,
    number3,
    number4,
    number5,
    number6,
    number7,
    number8,
    number9
];

interface StepBadgeProps {
    mode: string;
    level: number;
    className?: string;
}

export function StepBadge({
    mode,
    level,
    className = "h-9 w-9"
}: StepBadgeProps) {
    const background = mode === "X2"
        ? cBackground
        : mode === "D"
            ? dBackground
            : sBackground;
    const modeText = mode === "X2"
        ? cText
        : mode === "D"
            ? dText
            : sText;

    const isAbsolute = className.includes("absolute");

    return (
        <span className={`${isAbsolute ? "" : "relative"} inline-flex scale-[1.08] items-center justify-center ${className}`}>
            <img src={background} alt="" className="absolute inset-0 h-full w-full object-contain" />
            {mode === "X2" ? (
                <span className="absolute top-[36%] z-10 flex h-[50%] scale-[0.95] items-center justify-center gap-0.5">
                    <img src={cIcon} alt="C" className="h-full w-auto object-contain" />
                    <img src={numberImages[2]} alt="2" className="h-full w-auto object-contain" />
                </span>
            ) : (
                <span className="absolute top-[36%] z-10 flex h-[50%] scale-[0.95] items-center justify-center gap-0">
                    {String(level).split("").map((digit, index) => (
                        <img
                            key={`${digit}-${index}`}
                            src={numberImages[Number(digit)]}
                            alt={digit}
                            className="h-full w-auto object-contain"
                        />
                    ))}
                </span>
            )}
            <img src={modeText} alt="" className="absolute left-[-35%] top-[7%] z-10 w-[170%] max-w-none object-contain" />
        </span>
    );
}

function stateClasses(state: PhaseState) {
    if (state === "complete") {
        return {
            dot: "border-emerald-300 bg-emerald-300 text-zinc-950",
            line: "bg-emerald-400/70",
            text: "text-emerald-300"
        };
    }

    if (state === "active") {
        return {
            dot: "border-cyan-300 bg-cyan-300 text-zinc-950 shadow-[0_0_0_5px_rgba(103,232,249,0.12)]",
            line: "bg-cyan-400/70",
            text: "text-cyan-300"
        };
    }

    return {
        dot: "border-zinc-600 bg-zinc-900 text-zinc-500",
        line: "bg-zinc-700",
        text: "text-zinc-500"
    };
}

interface PhaseTimelineProps {
    championship: Championship;
    compact?: boolean;
    onOpenPhase?: (phase: Phase) => void;
}

export function PhaseTimeline({
    championship,
    compact = false,
    onOpenPhase
}: PhaseTimelineProps) {
    const phases = [...championship.phases].sort(
        (a, b) => a.order - b.order
    );

    return (
        <div className={`flex min-w-max items-start ${compact ? "gap-2" : "gap-3"}`}>
            {phases.map((phase, index) => {
                const state = getPhaseState(
                    phases,
                    phase,
                    championship.currentPhaseId,
                    championship.phaseActivation
                );
                const colors = stateClasses(state);

                return (
                    <div
                        key={phase.id}
                        className="flex items-start"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenPhase?.(phase)}
                            className={`group text-left ${onOpenPhase ? "cursor-pointer" : "cursor-default"}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black ${colors.dot}`}>
                                    {phaseStateMark(state)}
                                </span>
                                <span className={`text-[10px] font-black tracking-[0.18em] ${colors.text}`}>
                                    {phaseName(phase)}
                                </span>
                            </div>
                            <div className="mt-2 pl-9">
                                <p className="text-sm font-bold text-zinc-100 group-hover:text-white">
                                    {phaseDifficulty(phase)}
                                </p>
                                {!compact && (
                                    <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-zinc-500">
                                        {phaseStateLabel(state)}
                                    </p>
                                )}
                            </div>
                        </button>

                        {index < phases.length - 1 && (
                            <span className={`mx-3 mt-3 h-px w-8 ${colors.line}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

interface CategoryCardProps {
    championship: Championship;
    onOpen: () => void;
    onRemove: () => void;
}

export function CategoryCard({
    championship,
    onOpen,
    onRemove
}: CategoryCardProps) {
    const isLegends = championship.name.toLowerCase() === "legends";
    const isCoop = championship.name.toLowerCase() === "co-op x2";
    const phases = [...championship.phases].sort(
        (a, b) => a.order - b.order
    );
    const activeIndex = phases.findIndex(
        phase => phase.id === championship.currentPhaseId
    );
    const completed = activeIndex > 0 ? activeIndex : 0;
    const current = phases.find(
        phase => phase.id === championship.currentPhaseId
    );

    return (
        <article className={`group relative overflow-hidden rounded-2xl border bg-zinc-950/75 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-600 ${
            championship.currentPhaseId
                ? "border-cyan-400/30"
                : "border-zinc-800"
        }`}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-300/70 to-cyan-400/0 opacity-0 transition group-hover:opacity-100" />

            <div className="flex items-start justify-between gap-4">
                <button type="button" onClick={onOpen} className="min-w-0 text-left">
                    <p className="text-[10px] font-black tracking-[0.24em] text-cyan-300/80">
                        {isLegends ? "FORMATO ESPECIAL" : isCoop ? "DUPLAS / CO-OP" : "DIVISÃO"}
                    </p>
                    <h3 className="mt-2 truncate text-xl font-black tracking-tight text-white">
                        {championship.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-400">
                        {categoryRangeLabel(championship)}
                    </p>
                </button>

                <details
                    className="relative shrink-0"
                    onClick={event => event.stopPropagation()}
                >
                    <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-800 text-lg text-zinc-400 transition hover:border-zinc-600 hover:text-white">
                        ⋮
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-2xl">
                        <button type="button" onClick={onOpen} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800">
                            Abrir categoria
                        </button>
                        <button type="button" onClick={onRemove} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">
                            Remover categoria
                        </button>
                    </div>
                </details>
            </div>

            {isLegends ? (
                <button type="button" onClick={onOpen} className="mt-5 w-full rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/[0.06] p-4 text-left transition hover:border-fuchsia-300/50">
                    <p className="text-xs font-black tracking-[0.16em] text-fuchsia-200">⚔ BATTLE ROYALE</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-300">{LEGENDS_RANGE}</p>
                    <p className="mt-3 text-[10px] font-black tracking-[0.15em] text-fuchsia-300">
                        {!championship.requiresActivation
                            ? "SORTEIO LIVRE"
                            : championship.currentPhaseId
                                ? "COMPETIÇÃO ATIVA"
                                : "AGUARDANDO INÍCIO"}
                    </p>
                </button>
            ) : (
                <>
                    <div className="mt-5 overflow-x-auto pb-1">
                        <PhaseTimeline championship={championship} compact />
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
                        <div>
                            <p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">PROGRESSO</p>
                            <p className="mt-1 text-sm font-bold text-zinc-200">
                                {completed}/{phases.length} fases concluídas
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">STATUS</p>
                            <p className={`mt-1 text-xs font-black tracking-[0.12em] ${current ? "text-cyan-300" : "text-zinc-500"}`}>
                                {current ? `${phaseName(current)} · ATIVA` : "NÃO INICIADA"}
                            </p>
                        </div>
                    </div>
                </>
            )}

            <button type="button" onClick={onOpen} className="mt-4 text-xs font-black tracking-[0.16em] text-zinc-400 transition hover:text-white">
                ABRIR CATEGORIA <span className="ml-1 text-cyan-300">→</span>
            </button>
        </article>
    );
}
