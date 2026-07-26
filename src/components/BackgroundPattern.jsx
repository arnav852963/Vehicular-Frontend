import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export const BackgroundPattern = () => {
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-300">
            <div className={`absolute inset-0 transition-colors duration-300 ${isBeige ? "bg-[#f5f2eb]" : "bg-slate-950"}`} />

            <div
                className="absolute inset-0 opacity-85 transition-opacity duration-300"
                style={{
                    backgroundImage: isBeige
                        ? `
                            radial-gradient(circle at 1px 1px, rgba(180, 83, 9, 0.40) 1.5px, transparent 0),
                            linear-gradient(to right, rgba(180, 83, 9, 0.10) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(180, 83, 9, 0.10) 1px, transparent 1px)
                        `
                        : `
                            radial-gradient(circle at 1px 1px, rgba(129, 140, 248, 0.45) 1.5px, transparent 0),
                            linear-gradient(to right, rgba(99, 102, 241, 0.12) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.12) 1px, transparent 1px)
                        `,
                    backgroundSize: "28px 28px, 28px 28px, 28px 28px",
                }}
            />

            <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                    isBeige
                        ? "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.12),transparent_80%)]"
                        : "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent_80%)]"
                }`}
            />
        </div>
    );
};
