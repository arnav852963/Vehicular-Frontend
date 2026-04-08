import React from "react";

export const Message = ({payload , me , time , read=false  , sent  = false , received =false}) => {
    return (
        <>

            <div className={`flex w-full ${me ? "justify-end" : "justify-start"} py-1.5`}>
                <div className={`max-w-[86%] sm:max-w-[75%] ${me ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                        className={
                            "relative overflow-hidden px-3.5 py-2.5 shadow-lg shadow-black/20 ring-1 " +
                            (me
                                ? "rounded-2xl rounded-br-md bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 text-slate-50 ring-cyan-400/20"
                                : "rounded-2xl rounded-bl-md bg-zinc-950/70 text-zinc-100 ring-white/10")
                        }
                    >
                       
                        <div
                            className={
                                "pointer-events-none absolute inset-0 opacity-100 " +
                                (me
                                    ? (read
                                        ? "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.22),transparent_60%)]"
                                        : sent
                                            ? "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(56,189,248,0.22),transparent_60%)]"
                                            : "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(148,163,184,0.16),transparent_60%)]")
                                    : "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(148,163,184,0.10),transparent_60%)]")
                            }
                        />


                        <div
                            className={
                                "pointer-events-none absolute bottom-0 h-3 w-3 rotate-45 ring-1 " +
                                (me
                                    ? "-right-1 bg-slate-950 ring-cyan-400/20"
                                    : "-left-1 bg-zinc-950/70 ring-white/10")
                            }
                        />

                        <div className="relative">
                            {me && (
                                <div className="mb-1.5 flex items-center justify-end gap-1.5">
                                    {/* status dot */}
                                    <span
                                        className={
                                            "h-1.5 w-1.5 rounded-full " +
                                            (read
                                                ? "bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,0.14)]"
                                                : received
                                                    ? "bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
                                                    : sent
                                                        ? "bg-slate-200/80 shadow-[0_0_0_3px_rgba(226,232,240,0.10)]"
                                                        : "bg-slate-400/70 shadow-[0_0_0_3px_rgba(148,163,184,0.10)]")
                                        }
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={
                                            "text-[10px] font-semibold tracking-wide " +
                                            (read
                                                ? "text-sky-200/95"
                                                : received
                                                    ? "text-cyan-200/95"
                                                    : sent
                                                        ? "text-slate-200/90"
                                                        : "text-slate-300/80")
                                        }
                                    >
                                        {read ? "READ" : received ? "RECEIVED" : sent ? "SENT" : "SENDING"}
                                    </span>
                                </div>
                            )}

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
                        {!!time && (
                            <p className={`text-[11px] font-medium ${me ? "text-slate-300/70" : "text-slate-400/90"}`}>
                                {time}
                            </p>
                        )}

                        {me && (
                            <span
                                className={
                                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 transition " +
                                    (read
                                        ? "bg-sky-500/10 text-sky-200 ring-sky-500/25"
                                        : received
                                            ? "bg-cyan-500/10 text-cyan-200 ring-cyan-500/25"
                                            : sent
                                                ? "bg-slate-500/10 text-slate-100/90 ring-white/10"
                                                : "bg-slate-500/10 text-slate-300 ring-white/10")
                                }
                                aria-label={read ? "Read" : received ? "Received" : sent ? "Sent" : "Sending"}
                                title={read ? "Read" : received ? "Received" : sent ? "Sent" : "Sending"}
                            >
                                <span className="inline-flex items-center gap-0.5">
                                    <span
                                        className={(sent || received || read)
                                            ? (read ? "text-sky-200" : received ? "text-cyan-200" : "text-slate-200/90")
                                            : "text-slate-500/50"}
                                    >
                                        ✓
                                    </span>
                                    <span
                                        className={(received || read)
                                            ? (read ? "text-sky-200" : "text-cyan-200")
                                            : "text-slate-500/60"}
                                    >
                                        ✓
                                    </span>
                                </span>
                                <span>{read ? "Read" : received ? "Received" : sent ? "Sent" : "Sending"}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>




        </>
    )
}
