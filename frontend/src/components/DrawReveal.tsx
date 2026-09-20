import {
    useEffect,
    useState,
    useRef,
    useMemo
} from "react";

import { playPreview } from "../utils/drawAudio";
import { StepBadge } from "./CompetitionComponents";

import { ASSETS_URL } from "../services/config";
const BANNER_HEIGHT = 270;
const SPIN_ITEMS = 30;
const TICK_MS = 150;
const SPIN_SPEED = BANNER_HEIGHT / TICK_MS;
const SETTLE_MS = 2200;
const STOP_AHEAD_ITEMS = 8;
const REVEAL_DELAY = 4500;
const NEXT_STOP_DELAY = 5000;
const PREVIEW_GAP = 600;

interface DrawRevealProps {

    draws: {

        song: string;

        bannerPath: string;

        previewPath: string | null;

        mode: string;

        level: number;
    }[];

    availableCharts: {
            chart: {
                song: {
                    id: string;
                    title:string;
                    bannerPath: string;
                };
            };
        }[];

    audioContext?: AudioContext | null;
    rerollLevel?: number;
    onComplete?: () => void;
}

export default function DrawReveal({
    draws,
    availableCharts,
    audioContext,
    rerollLevel,
    onComplete
}: DrawRevealProps) {

    const sortedDraws =
        useMemo(
            () =>
                [...draws].sort(
                    (a, b) =>
                        a.level - b.level ||
                        a.song.localeCompare(
                            b.song
                        )
                ),
            [draws]
        );

    const visibleDraws = rerollLevel === undefined
        ? sortedDraws
        : sortedDraws.filter(
            draw => draw.level === rerollLevel
        );

    const [
        countdown,
        setCountdown
    ] = useState(3);

    const [
        started,
        setStarted
    ] = useState(false);

    const [ 
        rouletteList,
        setRouletteList
    ] = useState<string[][]>([]);

    const [
        roulettePosition,
        setRoulettePosition
    ] = useState<number[]>([]);

    const [
        rouletteDuration,
        setRouletteDuration
    ] = useState<number[]>([]);

    const [
        activeReveal,
        setActiveReveal
    ] = useState<number | null>(null);

    const [
        previewed,
        setPreviewed
    ] = useState<boolean[]>([]);

    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        if (!started) return;

        // eslint-disable-next-line react-hooks/exhaustive-deps

        const chartsRef =
            availableCharts;

        let cancelled = false;
        const timers: number[] = [];

        const sorted = rerollLevel === undefined
            ? sortedDraws
            : sortedDraws.filter(
                draw => draw.level === rerollLevel
            );

        const buildSpinReel = () => {
            const base = Array.from(
                { length: SPIN_ITEMS },
                () => {
                    const randomChart =
                        chartsRef[
                            Math.floor(
                                Math.random() *
                                chartsRef.length
                            )
                        ];

                    return randomChart.chart.song.bannerPath;
                }
            );

            return [...base, ...base];
        };

        const built = sorted.map(draw =>
            rerollLevel !== undefined &&
            draw.level !== rerollLevel
                ? [draw.bannerPath]
                : buildSpinReel()
        );
        const listRef = {
            current: built
        };
        const positionRef = {
            current: sorted.map(() => 0)
        };
        const stopped = sorted.map(draw =>
            rerollLevel !== undefined &&
            draw.level !== rerollLevel
        );
        const stopPromises: Array<Promise<void> | null> =
            sorted.map(() => null);

        setRouletteList(built);
        setRoulettePosition(positionRef.current);
        setRouletteDuration(
            sorted.map(() => 0)
        );

        const updatePosition =
            (index: number, value: number) =>
                setRoulettePosition(previous => {
                    const updated = [...previous];
                    updated[index] = value;
                    positionRef.current = updated;
                    return updated;
                });

        const stopReel =
            (index: number, delay: number) => {
                if (stopPromises[index]) {
                    return stopPromises[index];
                }

                const stopPromise = new Promise<void>(resolve => {
                    timers.push(
                        setTimeout(() => {
                            if (stopped[index]) {
                                resolve();
                                return;
                            }

                            stopped[index] = true;

                            const base = listRef.current[index].slice(
                                0,
                                SPIN_ITEMS
                            );
                            const currentPosition =
                                positionRef.current[index] ?? 0;
                            const currentIndex = Math.floor(
                                currentPosition / BANNER_HEIGHT
                            );
                            const landingIndex =
                                currentIndex + STOP_AHEAD_ITEMS;
                            const finalPosition =
                                landingIndex * BANNER_HEIGHT;

                            listRef.current[index] = Array.from(
                                { length: landingIndex + 1 },
                                (_, itemIndex) =>
                                    itemIndex === landingIndex
                                        ? sorted[index].bannerPath
                                        : base[
                                            itemIndex % base.length
                                        ]
                            );

                            setRouletteList([
                                ...listRef.current
                            ]);
                            setRouletteDuration(previous => {
                                const updated = [...previous];
                                updated[index] = SETTLE_MS;
                                return updated;
                            });
                            updatePosition(
                                index,
                                finalPosition
                            );

                            timers.push(
                                setTimeout(resolve, SETTLE_MS)
                            );
                        }, delay)
                    );
                });

                stopPromises[index] = stopPromise;
                return stopPromise;
            };

        const spinLoopHeight =
            SPIN_ITEMS * 2 * BANNER_HEIGHT;
        let lastTimestamp = 0;
        let animationFrame = 0;

        const spinFrame = (timestamp: number) => {
            if (cancelled) return;

            const elapsed = lastTimestamp === 0
                ? 0
                : timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            const updated = [...positionRef.current];

            sorted.forEach((_, index) => {
                if (stopped[index]) return;

                updated[index] =
                    (updated[index] + elapsed * SPIN_SPEED) %
                    spinLoopHeight;
            });

            positionRef.current = updated;
            setRoulettePosition(updated);
            animationFrame = window.requestAnimationFrame(spinFrame);
        };

        animationFrame = window.requestAnimationFrame(spinFrame);

        const revealIndexes = rerollLevel === undefined
            ? sorted.map((_, index) => index)
            : sorted
                .map((draw, index) =>
                    draw.level === rerollLevel ? index : -1
                )
                .filter(index => index >= 0);

        const revealLoop =
            async (sequenceIndex: number) => {
                if (
                    cancelled ||
                    sequenceIndex >= revealIndexes.length
                ) return;

                const index = revealIndexes[sequenceIndex];

                await stopReel(index, 0);

                if (cancelled) return;

                setActiveReveal(index);
                setPreviewed(previous => {
                    const updated = [...previous];
                    updated[index] = true;
                    return updated;
                });

                if (sequenceIndex + 1 < revealIndexes.length) {
                    stopReel(
                        revealIndexes[sequenceIndex + 1],
                        NEXT_STOP_DELAY
                    );
                }

                const previewPath =
                    sorted[index].previewPath;

                if (previewPath && audioContext) {
                    audioSourceRef.current?.stop();

                    await playPreview(
                        audioContext,
                        `${ASSETS_URL}/previewsongs/${previewPath}`
                    );
                } else if (previewPath) {
                    const audio =
                        new Audio(
                            `${ASSETS_URL}/previewsongs/${previewPath}`
                        );
                    audio.volume = 0.3;
                    audio.play();

                    await new Promise<void>(
                        resolve => {
                            audio.onended = () => resolve();
                        }
                    );
                } else {
                    await new Promise(
                        resolve =>
                            setTimeout(resolve, 3000)
                    );
                }

                if (cancelled) return;

                setActiveReveal(null);

                if (sequenceIndex === revealIndexes.length - 1) {
                    onComplete?.();
                    return;
                }

                timers.push(
                    setTimeout(
                        () => revealLoop(sequenceIndex + 1),
                        PREVIEW_GAP
                    )
                );
            };

        timers.push(
            setTimeout(
                () => revealLoop(0),
                REVEAL_DELAY
            )
        );

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(animationFrame);
            timers.forEach(clearTimeout);
            audioSourceRef.current?.stop();
        };
    }, [started]);

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStarted(false);

        setCountdown(3);

        const countdown3 =
            setTimeout(() => {
                setCountdown(2);
            }, 1000);

        const countdown2 =
            setTimeout(() => {
                setCountdown(1);
            }, 2000);

        const startReveal =
            setTimeout(() => {
                console.log("START REVEAL");
                setStarted(true);
            }, 3000);

        return () => {

            clearTimeout(
                countdown3
            );

            clearTimeout(
                countdown2
            );

            clearTimeout(
                startReveal
            );
        };
    }, [
        // draws, availableCharts
    ]);

    if (!started) {

        return (

            <div
                className="
                    text-center
                "
            >

                <div
                    className="
                        text-xs
                        font-black
                        tracking-[0.3em]

                        mb-6
                    "
                >
                    DRAWING SONGS
                </div>

                <div
                    className="
                        text-8xl
                        font-black

                        animate-pulse
                        text-cyan-300
                    "
                
                >
                    {countdown}
                </div>

            </div>
        );
    }

    return (

        <div
            className="
                flex
                items-center
                justify-center

                gap-10
                max-w-full
                overflow-x-auto

                overflow-x-visible

                py-8
            "
        >

            {
                visibleDraws.map (
                    (draw, index) => (

                        <div
                            key = {index}

                            className={`
                                bg-[#0d1118]
                                border
                                border-white/[0.08]

                                rounded-2xl

                                p-4

                                flex-shrink-0
                                
                                w-[512px]
                                h-[340px]

                                flex
                                items-center
                                justify-center

                                transition-all
                                duration-500

                                ${
                                    activeReveal === index
                                        ? `
                                            z-10
                                            scale-125
                                            ring-4
                                            ring-cyan-300
                                            shadow-[0_0_40px_rgba(103,232,249,0.25)]
                                        `
                                        : `
                                            border
                                            border-blue-500
                                        `
                                }
                            `}
                        >
                            <div
                                className="
                                    relative

                                    w-full

                                    h-[270px]

                                    overflow-hidden

                                    rounded-xl

                                    border
                                    border-zinc-700
                                "
                            >
                                <div
                                    className="
                                        transition-transform
                                    "

                                    style={{

                                        transitionDuration:
                                            `${rouletteDuration[index] ?? 0}ms`,

                                        transitionTimingFunction:
                                            rouletteDuration[index] === SETTLE_MS
                                                ? "ease-out"
                                                : "linear",

                                        transform:
                                            `translateY(-${
                                                roulettePosition[index] ?? 0
                                            }px)`
                                    }}
                                    >
                                    {
                                        rouletteList[index]?.map(
                                            (
                                                banner,
                                                bannerIndex
                                            ) => (

                                                <img

                                                    key={
                                                        bannerIndex
                                                    }

                                                    src={
                                                         `${ASSETS_URL}/banners/${encodeURIComponent(banner)}`
                                                    }

                                                    alt="Roulette"

                                                    className="
                                                        w-[480px]
                                                        h-[270px]

                                                        object-cover
                                                    "

                                                />
                                            )
                                        )
                                    }

                                </div>

                                {
                                    (previewed[index] || activeReveal === index) && (
                                        <StepBadge mode={draw.mode} level={draw.level} className="absolute bottom-5 right-5 z-30 h-14 w-14" />
                                    )
                                }

                            </div>

                        </div>
                    )
                )
            }
            
        </div>
    );
}
