import React, { useEffect, useRef, useState } from "react";
import { Gauge, Zap } from "lucide-react";
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
 * Rebuilds its scene whenever the theme or vehicle type changes.
 */
export const VehicleRoadScene = ({ type = "CAR", className = "" }) => {
    const mountRef = useRef(null);
    const speedRef = useRef(null);
    const [boosting, setBoosting] = useState(false);
    const { theme } = useTheme();
    const isBeige = theme === "beige";
    const activeType = normalizeType(type);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const scene = createRoadScene({
            container,
            palette: getPalette(theme),
            type: activeType,
            onSpeed: (kmh) => {
                if (speedRef.current) speedRef.current.textContent = kmh;
            },
            onBoost: setBoosting,
        });

        return () => scene?.dispose();
    }, [theme, activeType]);

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

            <div className={`pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isBeige ? "bg-emerald-600" : "bg-emerald-400"}`} />
                <span>{TYPE_LABELS[activeType]}</span>
            </div>
        </div>
    );
};
