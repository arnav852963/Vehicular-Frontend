import React from "react";
import { ChevronRight, KeyRound, ShieldCheck, Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const GoogleLogo = ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const PERKS = [
    { icon: Zap, label: "One tap" },
    { icon: KeyRound, label: "No password" },
    { icon: ShieldCheck, label: "Secure" },
];

/**
 * Primary sign-in call to action. Themed for dusk / beige, with a 3D "keycap"
 * press effect, a hover shimmer and a busy state while the popup is open.
 */
export const GoogleButton = ({ onClick, loading = false }) => {
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    const ring = isBeige
        ? "from-amber-400 via-orange-400 to-amber-600"
        : "from-indigo-400 via-sky-400 to-violet-500";
    const glow = isBeige
        ? "from-amber-300 via-orange-300 to-amber-400"
        : "from-indigo-500 via-sky-400 to-violet-500";
    const edge = isBeige
        ? "shadow-[0_4px_0_0_rgba(180,83,9,0.55),0_14px_28px_-8px_rgba(180,83,9,0.45)] active:shadow-[0_1px_0_0_rgba(180,83,9,0.55),0_6px_14px_-6px_rgba(180,83,9,0.4)]"
        : "shadow-[0_4px_0_0_rgba(49,46,129,0.95),0_14px_30px_-8px_rgba(99,102,241,0.55)] active:shadow-[0_1px_0_0_rgba(49,46,129,0.95),0_6px_16px_-6px_rgba(99,102,241,0.5)]";
    const face = isBeige
        ? "bg-[#fffdf8] text-stone-900"
        : "bg-slate-950 text-slate-50";
    const sub = isBeige ? "text-stone-500" : "text-slate-400";
    const chip = isBeige ? "bg-white ring-1 ring-amber-200 shadow-sm" : "bg-white shadow-sm shadow-black/40";

    return (
        <div>
            <div className="relative group">
                <div
                    className={`pointer-events-none absolute -inset-1 rounded-[22px] bg-gradient-to-r blur-xl transition-opacity duration-300 ${glow} ${
                        isBeige ? "opacity-35 group-hover:opacity-60" : "opacity-40 group-hover:opacity-70"
                    }`}
                />

                <span
                    className={`absolute -top-2.5 right-4 z-20 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md ${
                        isBeige ? "bg-amber-600 text-white" : "bg-sky-400 text-slate-950"
                    }`}
                >
                    Fastest
                </span>

                <button
                    type="button"
                    onClick={onClick}
                    disabled={loading}
                    aria-busy={loading}
                    className={`relative block w-full rounded-2xl bg-gradient-to-r p-[1.5px] transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-[3px] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ring} ${edge} ${
                        isBeige ? "focus-visible:ring-amber-500 focus-visible:ring-offset-[#f5f2eb]" : "focus-visible:ring-sky-400 focus-visible:ring-offset-slate-950"
                    }`}
                >
                    <span className={`relative flex items-center gap-3.5 overflow-hidden rounded-[14px] px-3.5 py-3 ${face}`}>
                        <span
                            className={`pointer-events-none absolute inset-0 ${
                                isBeige
                                    ? "bg-gradient-to-b from-white/70 to-amber-100/40"
                                    : "bg-gradient-to-b from-white/[0.07] to-transparent"
                            }`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-[110%] group-hover:opacity-100" />

                        <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chip}`}>
                            {loading ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                            ) : (
                                <GoogleLogo />
                            )}
                        </span>

                        <span className="relative flex flex-col items-start text-left leading-tight">
                            <span className="text-[15px] font-semibold tracking-tight">
                                {loading ? "Opening Google…" : "Continue with Google"}
                            </span>
                            <span className={`mt-0.5 text-[11px] font-medium ${sub}`}>
                                {loading ? "Finish in the popup window" : "Sign in or create your account"}
                            </span>
                        </span>

                        <ChevronRight
                            className={`relative ml-auto h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${
                                isBeige ? "text-amber-700" : "text-sky-300"
                            }`}
                        />
                    </span>
                </button>
            </div>

            <ul className="mt-4 flex items-center justify-center gap-2">
                {PERKS.map(({ icon, label }) => (
                    <li
                        key={label}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                            isBeige
                                ? "border-amber-300/60 bg-amber-50/80 text-amber-900"
                                : "border-indigo-400/20 bg-indigo-500/10 text-indigo-200"
                        }`}
                    >
                        {React.createElement(icon, { className: `h-3 w-3 ${isBeige ? "text-amber-600" : "text-sky-300"}` })}
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
};
