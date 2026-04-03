import React from "react";

export const Notification = ({message}) => {
    return (
        <>
            <div className="w-full px-4">
                <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-slate-950 px-4 py-3 shadow-2xl shadow-black/40 ring-1 ring-white/10">

                    <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(56,189,248,0.18),transparent_60%)]" />

                    <div className="relative flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-white/10">
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Notification
                            </p>
                            <h1 className="mt-0.5 break-words text-[15px] font-semibold leading-5 text-slate-50">
                                {message}
                            </h1>
                            <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <p className="mt-2 text-[12px] font-medium text-slate-400">
                                Tap anywhere to continue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        
        
        </>
    )
}
