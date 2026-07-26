import React from "react";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext.jsx";

export const Logo = () => {
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    return (
        <div className="flex items-center gap-2 select-none">
            <span className={`inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border transition-colors ${
                isBeige ? "bg-amber-100/90 border-amber-300/80" : "bg-slate-900 border-slate-800"
            }`}>
                <img
                    src={logo}
                    alt="VehicularQR"
                    className="h-8 w-8 object-contain"
                    draggable={false}
                />
            </span>
            <h1 className={`text-lg font-semibold tracking-tight transition-colors ${
                isBeige ? "text-stone-900" : "text-slate-100"
            }`}>
                Vehicular
                <span className={isBeige ? "text-amber-600 font-bold" : "text-indigo-400 font-bold"}>QR</span>
            </h1>
        </div>
    );
};
