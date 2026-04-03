import React from "react";

export const Message = ({payload , me , timestamp , read=false }) => {
    return (
        <>

            <div className={`flex w-full ${me ? "justify-end" : "justify-start"} py-1.5`}>
                <div className={`max-w-[86%] sm:max-w-[75%] ${me ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                        className={
                            "relative overflow-hidden px-3.5 py-2.5 shadow-lg shadow-black/20 ring-1 " +
                            (me
                                ? "rounded-2xl rounded-br-md bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-slate-50 ring-cyan-400/15"
                                : "rounded-2xl rounded-bl-md bg-zinc-900/70 text-zinc-100 ring-white/10")
                        }
                    >
                       
                        <div
                            className={
                                "pointer-events-none absolute inset-0 opacity-100 " +
                                (me
                                    ? "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(56,189,248,0.22),transparent_60%)]"
                                    : "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(148,163,184,0.10),transparent_60%)]")
                            }
                        />


                        <div
                            className={
                                "pointer-events-none absolute bottom-0 h-3 w-3 rotate-45 ring-1 " +
                                (me
                                    ? "-right-1 bg-slate-900 ring-cyan-400/15"
                                    : "-left-1 bg-zinc-900/70 ring-white/10")
                            }
                        />

                        <div className="relative">
                            {payload?.image && (
                                <div className="mb-2">
                                    <img
                                        src={payload.image}
                                        alt="captured image"
                                        loading="lazy"
                                        className={
                                            "h-auto w-full max-w-[260px] rounded-xl object-cover ring-1 " +
                                            (me ? "ring-white/10" : "ring-white/10")
                                        }
                                    />
                                </div>
                            )}

                            {payload?.text && (
                                <p className="whitespace-pre-wrap break-words text-[15px] leading-5 text-inherit">
                                    {payload.text}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 ${me ? "justify-end" : "justify-start"}`}>
                        <p className="text-[11px] font-medium text-slate-400/90">
                            {timestamp}
                        </p>

                       
                        {me && (
                            <span
                                className={
                                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 transition " +
                                    (read
                                        ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25"
                                        : "bg-zinc-500/10 text-zinc-300 ring-white/10")
                                }
                                aria-label={read ? "Read" : "Delivered"}
                                title={read ? "Read" : "Delivered"}
                            >
                                <span className="inline-flex items-center gap-0.5">
                                    <span className={read ? "text-emerald-300" : "text-zinc-300"}>✓</span>
                                    <span className={read ? "text-emerald-300" : "text-zinc-500/70"}>✓</span>
                                </span>
                                <span>{read ? "Read" : "Delivered"}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>




        </>
    )
}
