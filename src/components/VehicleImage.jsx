import React from 'react'

export const VehicleImage = ({url , key}) => {
    return (
        <>
        <div className="w-full">
            <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900/60 ring-1 ring-white/10 shadow-lg shadow-black/30">

                <div className="aspect-[16/10] w-full">
                    {url ? (
                        <img
                            key={key}
                            src={url}
                            alt="vehicle-image"
                            loading="lazy"
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-2 px-6 text-center">
                                <div className="h-10 w-10 rounded-xl bg-slate-800/60 ring-1 ring-white/10" />
                                <p className="text-[12px] font-medium text-slate-400">No image available</p>
                            </div>
                        </div>
                    )}
                </div>


                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(56,189,248,0.10),transparent_65%)]" />
            </div>
        </div>
        
        </>
    )
}
