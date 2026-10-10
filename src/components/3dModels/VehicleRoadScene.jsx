import React, { useEffect, useRef, useState } from "react";
import { Gauge, Repeat, Zap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getPalette } from "./scenePalettes.js";
import { createRoadScene } from "./roadScene.js";
import { VEHICLE_TYPES } from "./vehicleModels.js";

const TYPE_LABELS = { CAR: "Car", MOTORCYCLE: "Motorcycle", TRUCK: "Truck", BUS: "Bus" };

const normalizeType = (type) => {
    const upper = typeof type === "string" ? type.toUpperCase() : "CAR";
    return VEHICLE_TYPES.includes(upper) ? upper : "CAR";
};

/**
 * Themed, interactive 3D road scene. Drag / hold to rev the vehicle.
 * With `cycle`, tapping the vehicle label swaps to the next vehicle type
 * (Car -> Motorcycle -> Truck -> Bus -> Car ...) without rebuilding the scene.
 */
export const VehicleRoadScene = ({ type = "CAR", className = "", cycle = false }) => {
    const mountRef = useRef(null);
    const speedRef = useRef(null);
    const sceneRef = useRef(null);
    const currentRef = useRef("CAR");
    const [boosting, setBoosting] = useState(false);
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
        });
        sceneRef.current = scene;

        return () => {
            scene?.dispose();
            sceneRef.current = null;
        };
    }, [theme]);

    useEffect(() => {
        sceneRef.current?.setType(current);
    }, [current]);

    const nextType = () => VEHICLE_TYPES[(VEHICLE_TYPES.indexOf(current) + 1) % VEHICLE_TYPES.length];

    const chip = isBeige
        ? "border-amber-400/40 bg-amber-50/85 text-amber-900"
        : "border-indigo-400/25 bg-slate-950/55 text-indigo-100";

    return (
        <div
            className={`relative h-56 sm:h-64 w-full rounded-2xl border overflow-hidden shadow-xl select-none transition-colors duration-200 ${
                isBeige ? "border-amber-300/60 shadow-amber-900/10" : "border-indigo-400/20 shadow-black/40"
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

            <div className={`pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md ${chip}`}>
                <Gauge className={`h-3.5 w-3.5 ${isBeige ? "text-amber-700" : "text-sky-300"}`} />
                <span className="text-[11px] font-semibold tabular-nums">
                    <span ref={speedRef}>48</span> <span className="opacity-70">km/h</span>
                </span>
            </div>

            <div className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-200 ${
                boosting
                    ? isBeige
                        ? "border-amber-600 bg-amber-500 text-white"
                        : "border-sky-300/60 bg-sky-400/20 text-sky-100"
                    : chip
            }`}>
                <Zap className={`h-3 w-3 ${boosting ? "" : isBeige ? "text-amber-600" : "text-indigo-300"}`} />
                <span>{boosting ? "Boost!" : "Hold & drag"}</span>
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
        </div>
    );
};
