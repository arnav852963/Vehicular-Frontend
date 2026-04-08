import React from "react";
import {Link} from "react-router-dom";

export const Button = ({label="" , to }) => {
    return (
        <>

            <Link to={to} className="block w-full">
                <button
                    type="button"
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 px-5 py-3 text-base font-semibold text-slate-50 shadow-lg shadow-black/20 ring-1 ring-white/10 transition active:scale-[0.99] active:from-slate-700 active:to-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                    <span className="absolute inset-0 rounded-xl bg-[radial-gradient(80%_60%_at_50%_0%,rgba(56,189,248,0.22),transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative">{label}</span>
                </button>
            </Link>

        </>
    )
}
