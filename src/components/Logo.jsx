import React from "react";
import logoDusk from "../assets/logo-dusk.svg";
import logoBeige from "../assets/logo-beige.svg";
import { useTheme } from "../context/ThemeContext.jsx";

export const LogoMark = ({ className = "h-9 w-9" }) => {
    const { theme } = useTheme();

    return (
        <img
            src={theme === "beige" ? logoBeige : logoDusk}
            alt="VehicularQR"
            className={className}
            draggable={false}
        />
    );
};

export const Logo = () => {
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    return (
        <div className="flex items-center gap-2 select-none">
            <LogoMark className="h-9 w-9 shrink-0" />
            <h1 className={`text-lg font-semibold tracking-tight transition-colors ${
                isBeige ? "text-stone-900" : "text-slate-100"
            }`}>
                Vehicular
                <span className={isBeige ? "text-amber-600 font-bold" : "text-indigo-400 font-bold"}>QR</span>
            </h1>
        </div>
    );
};
