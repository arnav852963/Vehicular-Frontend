import {useEffect, useState} from "react";
import {vehicleApi} from "../api/vehicle.js";
import {Link} from "react-router-dom";
import {Container} from "../components/Container.jsx";
import {ChevronRight} from "lucide-react";

export const VehiclesPage = () => {

    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({
        error: false,
        message: ""
    })

    useEffect(() => {
        (async ()=>{

            try {


                const getVehicles = await vehicleApi.getUserVehicles()
                if (!getVehicles || !getVehicles?.data || !getVehicles?.data?.data || getVehicles?.data?.statusCode !== 200) {
                    setError({
                        error: true,
                        message: getVehicles?.data?.message || "could not fetch vehicles"
                    })
                    setLoading(false)
                    return
                }

                setVehicles(getVehicles?.data?.data)
                setLoading(false)
            } catch (e) {
                setError({
                    error: true,
                    message: e?.response?.data?.message || e?.message || "An error occurred while fetching vehicles"
                })
                setLoading(false)
            }


        } )()
    }, []);


if(error && error?.error){
    return (
        <Container>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_85%_0%,rgba(244,63,94,0.10),transparent_55%)]" />
                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <p className="text-xs font-medium tracking-wide text-zinc-400">Garage</p>
                    <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">My <span className="text-sky-300">Vehicles</span></h1>

                    <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 shadow-[0_14px_40px_-28px_rgba(244,63,94,0.45)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-rose-200/80">Error</p>
                                <p className="mt-1 text-base font-semibold text-rose-100">{error?.message || "An error occurred while fetching vehicles"}</p>
                            </div>
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                        </div>
                        <p className="mt-3 text-sm text-zinc-400">Refresh the page and try again.</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
    return !loading ? (
        <Container>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(800px_500px_at_50%_120%,rgba(16,185,129,0.08),transparent_55%)]" />

                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-zinc-400">Garage</p>
                            <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">My <span className="text-sky-300">Vehicles</span></h1>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Tap a vehicle to open status, images and QR.</p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-zinc-800/70 bg-zinc-900/60 px-3 py-2 text-right">
                            <p className="text-[11px] font-medium text-zinc-400">Total</p>
                            <p className="text-lg font-semibold text-zinc-100">{vehicles.length}</p>
                        </div>
                    </div>

                    {(!vehicles || vehicles?.length === 0) && (
                        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-200">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">No vehicles yet</p>
                                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">Add a vehicle to generate a QR and receive alerts.</p>
                                </div>
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                            </div>
                        </div>
                    )}

                    {vehicles && vehicles?.length > 0 && (
                        <div className="mt-5 space-y-3">
                            {vehicles.map((vehicle , index) => (
                                <div key={index}>
                                    <Link
                                        to={`/vehicleStatus/${vehicle?._id}`}
                                        className="group relative block overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/55 shadow-[0_18px_60px_-44px_rgba(0,0,0,0.95)] transition duration-200 active:scale-[0.99]"
                                    >
                                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                                            <div className="absolute -inset-10 bg-[radial-gradient(420px_220px_at_30%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(380px_220px_at_80%_15%,rgba(16,185,129,0.10),transparent_55%)]" />
                                        </div>

                                        <div className="relative">
                                            <div className="aspect-[16/9] w-full bg-zinc-900">
                                                {vehicle?.vehicleImage?.[0] ? (
                                                    <img
                                                        src={vehicle.vehicleImage[0]}
                                                        alt={vehicle?.plateNumber}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <div className="flex flex-col items-center gap-2 px-6 text-center">
                                                            <div className="h-10 w-10 rounded-xl bg-zinc-800/60 ring-1 ring-white/10" />
                                                            <p className="text-xs font-medium text-zinc-400">No image</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(56,189,248,0.12),transparent_65%)]" />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />

                                            <div className="pointer-events-none absolute right-3 top-3 grid place-items-center">
                                                <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/45 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md">
                                                    Open
                                                    <ChevronRight className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Plate</p>
                                                    <p className="mt-1 truncate text-base font-semibold text-zinc-100">
                                                        {vehicle?.plateNumber}
                                                    </p>
                                                    {vehicle?.vehicleType ? (
                                                        <p className="mt-1 text-xs text-zinc-500">{vehicle.vehicleType}</p>
                                                    ) : null}
                                                </div>

                                                {vehicle?.isActive !== undefined ? (
                                                    <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${vehicle.isActive ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20" : "bg-rose-500/10 text-rose-200 ring-rose-500/20"}`}>
                                                        {vehicle.isActive ? "Active" : "Inactive"}
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 inline-flex items-center rounded-full bg-zinc-900/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 ring-1 ring-white/10">
                                                        Open
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <p className="text-xs text-zinc-500">Tap to view status • QR • images</p>
                                                <ChevronRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-200" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    ) : (
        <Container>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%)]" />
                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <div className="animate-pulse rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5">
                        <div className="h-4 w-20 rounded bg-zinc-800" />
                        <div className="mt-3 h-7 w-44 rounded bg-zinc-800" />
                        <div className="mt-6 space-y-3">
                            <div className="h-40 rounded-2xl bg-zinc-900" />
                            <div className="h-40 rounded-2xl bg-zinc-900" />
                            <div className="h-40 rounded-2xl bg-zinc-900" />
                        </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-zinc-500">Loading...</p>
                </div>
            </div>
        </Container>
    )
}
