import React from "react";

export const Notification = ({message}) => {
    return (
        <div className="pointer-events-none flex w-full justify-center">
            <div className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-full border border-indigo-500/20 bg-slate-800/80 pb-2 pl-3 pr-4 pt-2 shadow-sm backdrop-blur-md">
                
                <div className="flex shrink-0 items-center justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-80" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    </span>
                </div>
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-wide text-slate-100 pb-0.5">
                    {message}
                </p>
            </div>
        </div>
    )
}
