import React from "react";

export const Notification = ({message}) => {
    return (
        <div className="pointer-events-none flex w-full justify-center">
            <div className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-full border border-sky-500/20 bg-zinc-900/70 pb-2 pl-3 pr-4 pt-2 shadow-[0_8px_30px_-4px_rgba(34,211,238,0.15)] backdrop-blur-md">
                <div className="pointer-events-none absolute inset-0 opacity-70">
                    <div className="absolute -left-1/2 top-0 h-full w-[200%] animate-vehicular-shimmer bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                </div>
                <div className="flex shrink-0 items-center justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-80" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                    </span>
                </div>
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-wide text-zinc-100 pb-0.5">
                    {message}
                </p>
            </div>
        </div>
    )
}
