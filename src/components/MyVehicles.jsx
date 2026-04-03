import React from "react";
import {VehicleImage} from "./VehicleImage.jsx";


export const MyVehicles = ({urls}) => {
    if(urls.length === 0){
        
        return (
            <section className="w-full px-4">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-3">
                        <h2 className="text-[13px] font-semibold tracking-wide text-slate-200">My Vehicles</h2>
                        <p className="mt-0.5 text-[12px] font-medium text-slate-400">
                            Your vehicle images appear here.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-slate-950 p-4 shadow-2xl shadow-black/40 ring-1 ring-white/10">
                        <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(56,189,248,0.16),transparent_60%)]" />
                        <div className="relative flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-white/10">
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-300/60" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">No images</p>
                                <p className="mt-0.5 text-[14px] font-semibold text-slate-50">No images added yet</p>
                                <p className="mt-1 text-[12px] font-medium text-slate-400">
                                    Add at least one photo to make your vehicle cards more recognizable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
    
    
    
    
    
    return (
        <>
        <section className="w-full px-4">
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                        <h2 className="text-[13px] font-semibold tracking-wide text-slate-200">My Vehicles</h2>
                        <p className="mt-0.5 text-[12px] font-medium text-slate-400">
                            Tap an image to view it larger (if enabled).
                        </p>
                    </div>
                    <div className="rounded-full bg-zinc-900/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300 ring-1 ring-white/10">
                        {urls.length} {urls.length === 1 ? "image" : "images"}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {
                        urls.map((url , index) => (
                            <VehicleImage key = {index} url={url} />
                        ))
                        
                        
                    }
                </div>
            </div>
        </section>
        
        
        
        </>
    )
}
