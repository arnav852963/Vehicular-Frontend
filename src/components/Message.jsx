import React from "react";

export const Message = ({payload , me , time  , vehicleImage ="" , received }) => {
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
                                    ? "bg-[radial-gradient(120%_80%_at_50%_0%,rgba(56,189,248,0.18),transparent_60%)]"
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

                        {vehicleImage && (
                            <div className="relative mb-2 overflow-hidden rounded-xl ring-1 ring-white/10">
                                <img
                                    src={vehicleImage}
                                    alt={payload || "Attachment"}
                                    loading="lazy"
                                    className="h-auto w-full max-h-64 object-cover"
                                />
                                <div
                                    className={
                                        "pointer-events-none absolute inset-0 " +
                                        (me
                                            ? "bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"
                                            : "bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent")
                                    }
                                />
                            </div>
                        )}

                        <div className="relative">
                            {!!payload && (
                                <p className="whitespace-pre-wrap break-words text-[15px] leading-5 text-inherit">
                                    {payload}
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
                                    "select-none text-[12px] font-semibold tracking-tight " +
                                    (received ? "text-cyan-300/90" : "text-slate-300/60")
                                }
                                aria-label={received ? "Delivered" : "Sent"}
                                title={received ? "Delivered" : "Sent"}
                            >
                                {received ? "✓✓" : "✓"}
                            </span>
                        )}
                    </div>
                </div>
            </div>




        </>
    )
}
