import React from "react";

export const Qr = ({qr , plateNumber}) => {
    return (
        <>

            <div className="w-full">
                <div className="mx-auto w-full max-w-md sm:max-w-lg">
                    <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold tracking-tight text-zinc-50">Vehicle QR</h2>
                                <p className="mt-1 text-sm text-zinc-300/90">
                                    Scan to contact you anonymously.
                                </p>
                            </div>

                            <span className="shrink-0 inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-500/20">
                                {plateNumber}
                            </span>
                        </div>

                        <div className="mt-5">
                            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 p-3">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(34,211,238,0.16),transparent_60%)]" />

                                <div className="relative mx-auto aspect-square w-full max-w-[320px] rounded-xl bg-white p-3 shadow-xl shadow-black/30 ring-1 ring-black/10">

                                    <img
                                        src={qr}
                                        alt={`QR code for ${plateNumber}`}
                                        loading="lazy"
                                        className="h-full w-full rounded-lg object-contain"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-1">
                                <p className="text-xs text-zinc-400/95">
                                    Tip: Print this and place it on the inside of your windshield.
                                </p>
                                <p className="text-[11px] text-zinc-500/90">
                                    Keep it visible and avoid covering it with tinted film.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}
