import React from "react";

export const Notification = ({message}) => {
    return (
        <>
            <div className="w-full px-3">
                <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-slate-950 px-3 py-2.5 shadow-2xl shadow-black/40 ring-1 ring-white/10">

                    <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(56,189,248,0.18),transparent_60%)]" />

                    <div className="relative flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 ring-1 ring-white/10">
                            <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.16)]" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Notification
                            </p>
                            <h1 className="mt-0.5 break-words text-[13px] font-semibold leading-[1.15rem] text-slate-50">
                                {message}
                            </h1>
                            <div className="mt-1.5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                                Tap anywhere to continue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        
        
        </>
    )
}
