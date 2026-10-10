import React, { useEffect, useRef, useState } from "react";
import { Gauge, Repeat, RotateCcw, TriangleAlert, Zap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getPalette } from "./scenePalettes.js";
import { createRoadScene } from "./roadScene.js";
import { VEHICLE_TYPES } from "./vehicleModels.js";

const TYPE_LABELS = { CAR: "Car", MOTORCYCLE: "Motorcycle", TRUCK: "Truck", BUS: "Bus" };
const DANGER_SECONDS = 10; // keep in sync with roadScene.js

const normalizeType = (type) => {
    const upper = typeof type === "string" ? type.toUpperCase() : "CAR";
    return VEHICLE_TYPES.includes(upper) ? upper : "CAR";
};

/**
 * Themed, interactive 3D road scene. Drag / hold to rev the vehicle.
 *
 * - With `cycle`, tapping the vehicle label swaps to the next vehicle type
 *   (Car -> Motorcycle -> Truck -> Bus -> Car ...) without rebuilding the scene.
 * - Staying above 100 km/h for 10 seconds causes a crash; tap the scene to restart.
 */
export const VehicleRoadScene = ({ type = "CAR", className = "", cycle = false }) => {
    const mountRef = useRef(null);
    const speedRef = useRef(null);
    const sceneRef = useRef(null);
    const currentRef = useRef("CAR");
    const [boosting, setBoosting] = useState(false);
    const [danger, setDanger] = useState(0); // 0..1 - how close the overspeed timer is to a crash
    const [crashPhase, setCrashPhase] = useState("none"); // none | impact | settled
    const [picked, setPicked] = useState(null); // vehicle chosen by tapping; null = follow the `type` prop
    const { theme } = useTheme();
    const isBeige = theme === "beige";
    const current = (cycle && picked) || normalizeType(type);

    useEffect(() => {
        currentRef.current = current;
    });

    // build once per theme; vehicle swaps happen inside the live scene
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const scene = createRoadScene({
            container,
            palette: getPalette(theme),
            type: currentRef.current,
            onSpeed: (kmh) => {
                if (speedRef.current) speedRef.current.textContent = kmh;
            },
            onBoost: setBoosting,
            onDanger: setDanger,
            onCrash: setCrashPhase,
        });
        sceneRef.current = scene;

        return () => {
            scene?.dispose();
            sceneRef.current = null;
            setDanger(0);
            setCrashPhase("none");
        };
    }, [theme]);

    useEffect(() => {
        sceneRef.current?.setType(current);
    }, [current]);

    const nextType = () => VEHICLE_TYPES[(VEHICLE_TYPES.indexOf(current) + 1) % VEHICLE_TYPES.length];
    const restart = () => sceneRef.current?.restart();

    const crashed = crashPhase !== "none";
    const warning = !crashed && danger >= 0.15;
    const secondsLeft = Math.max(1, Math.ceil((1 - danger) * DANGER_SECONDS));

    const chip = isBeige
        ? "border-amber-400/40 bg-amber-50/85 text-amber-900"
        : "border-indigo-400/25 bg-slate-950/55 text-indigo-100";
    const alertChip = isBeige
        ? "border-rose-500/70 bg-rose-100/95 text-rose-900"
        : "border-rose-400/60 bg-rose-500/25 text-rose-100";

    return (
        <div
            className={`relative h-56 sm:h-64 w-full rounded-2xl border overflow-hidden shadow-xl select-none transition-colors duration-200 ${
                danger > 0.05 || crashed
                    ? isBeige
                        ? "border-rose-400/70 shadow-rose-900/20"
                        : "border-rose-500/50 shadow-rose-900/40"
                    : isBeige
                        ? "border-amber-300/60 shadow-amber-900/10"
                        : "border-indigo-400/20 shadow-black/40"
            } ${className}`}
            style={{
                background: isBeige
                    ? "linear-gradient(#fbe4b4, #f6e9d3)"
                    : "linear-gradient(#050716, #2a2d78)",
            }}
        >
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            {/* edge vignette so the HUD stays readable on any sky */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: isBeige
                        ? "radial-gradient(ellipse at center, transparent 55%, rgba(120,80,30,0.16) 100%)"
                        : "radial-gradient(ellipse at center, transparent 50%, rgba(3,4,15,0.55) 100%)",
                }}
            />

            {/* danger vignette: creeps in as the overspeed timer fills */}
            {danger > 0.05 && !crashed ? (
                <div
                    className={`pointer-events-none absolute inset-0 ${danger > 0.5 ? "animate-pulse" : ""}`}
                    style={{
                        opacity: Math.min(1, danger * 1.2),
                        background: "radial-gradient(ellipse at center, transparent 35%, rgba(225,29,72,0.55) 100%)",
                    }}
                />
            ) : null}

            <div className={`pointer-events-none absolute left-3 top-3 overflow-hidden flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md transition-colors ${warning || crashed ? alertChip : chip}`}>
                <Gauge className={`h-3.5 w-3.5 ${warning || crashed ? "" : isBeige ? "text-amber-700" : "text-sky-300"}`} />
                <span className="text-[11px] font-semibold tabular-nums">
                    <span ref={speedRef}>48</span> <span className="opacity-70">km/h</span>
                </span>
                {danger > 0 && !crashed ? (
                    <span
                        className="absolute bottom-0 left-0 h-[2px] bg-rose-500 transition-[width] duration-200"
                        style={{ width: `${danger * 100}%` }}
                    />
                ) : null}
            </div>

            <div className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-200 ${
                warning
                    ? `${alertChip} animate-pulse`
                    : boosting
                        ? isBeige
                            ? "border-amber-600 bg-amber-500 text-white"
                            : "border-sky-300/60 bg-sky-400/20 text-sky-100"
                        : chip
            }`}>
                {warning ? (
                    <TriangleAlert className="h-3 w-3" />
                ) : (
                    <Zap className={`h-3 w-3 ${boosting ? "" : isBeige ? "text-amber-600" : "text-indigo-300"}`} />
                )}
                <span>{warning ? `Slow down! ${secondsLeft}s` : boosting ? "Boost!" : "Hold & drag"}</span>
            </div>

            {cycle ? (
                <button
                    type="button"
                    onClick={() => setPicked(nextType())}
                    aria-label={`Vehicle: ${TYPE_LABELS[current]}. Tap to switch to ${TYPE_LABELS[nextType()]}`}
                    className={`group absolute bottom-3 left-3 flex items-center gap-2 rounded-full border py-1 pl-2.5 pr-2 text-[10px] font-semibold backdrop-blur-md transition duration-150 hover:-translate-y-0.5 active:translate-y-px active:scale-95 focus:outline-none focus-visible:ring-2 ${chip} ${
                        isBeige ? "focus-visible:ring-amber-500" : "focus-visible:ring-sky-400"
                    }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isBeige ? "bg-emerald-600" : "bg-emerald-400"}`} />
                    <span>{TYPE_LABELS[current]}</span>
                    <span className="flex items-center gap-0.5" aria-hidden="true">
                        {VEHICLE_TYPES.map((t) => (
                            <span
                                key={t}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    t === current
                                        ? `w-3 ${isBeige ? "bg-amber-600" : "bg-sky-300"}`
                                        : `w-1 ${isBeige ? "bg-amber-900/25" : "bg-white/25"}`
                                }`}
                            />
                        ))}
                    </span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isBeige ? "bg-amber-600/15 text-amber-700" : "bg-sky-400/15 text-sky-300"}`}>
                        <Repeat className="h-3 w-3 transition-transform duration-300 group-active:rotate-180" />
                    </span>
                </button>
            ) : (
                <div className={`pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isBeige ? "bg-emerald-600" : "bg-emerald-400"}`} />
                    <span>{TYPE_LABELS[current]}</span>
                </div>
            )}

            {/* impact flash */}
            {crashPhase === "impact" ? (
                <div className="pointer-events-none absolute inset-0 z-20 bg-white animate-vehicular-flash" />
            ) : null}

            {/* crash message - tap anywhere to restart */}
            {crashPhase === "settled" ? (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="You crashed. Tap to restart."
                    onClick={restart}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && restart()}
                    className="absolute inset-0 z-30 flex cursor-pointer items-end justify-center bg-gradient-to-t from-black/55 via-black/10 to-transparent px-3 pb-3 animate-vehicular-fade focus:outline-none sm:items-center sm:pb-0"
                >
                    <div
                        className={`animate-vehicular-pop flex w-full max-w-sm items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-2xl backdrop-blur-md ${
                            isBeige
                                ? "border-rose-400/70 bg-[#fffdf8]/95 text-stone-900 shadow-rose-900/30"
                                : "border-rose-500/50 bg-slate-950/90 text-slate-50 shadow-rose-900/50"
                        }`}
                    >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isBeige ? "bg-rose-100 text-rose-600" : "bg-rose-500/15 text-rose-400"
                        }`}>
                            <TriangleAlert className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className={`text-[15px] font-extrabold leading-tight tracking-tight ${isBeige ? "text-rose-700" : "text-rose-300"}`}>
                                Don&apos;t rash drive!
                            </h3>
                            <p className={`mt-0.5 text-[11px] leading-snug ${isBeige ? "text-stone-600" : "text-slate-300"}`}>
                                Over 100 km/h for {DANGER_SECONDS}s ends in a crash. Slow down &mdash; arrive alive.
                            </p>
                            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold animate-pulse ${
                                isBeige ? "bg-amber-500 text-white" : "bg-sky-400 text-slate-950"
                            }`}>
                                <RotateCcw className="h-3 w-3" />
                                Tap anywhere to restart
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
