import {useEffect, useState} from "react";
import {vehicleApi} from "../api/vehicle.js";
import {Link, useLocation} from "react-router-dom";
import {Container} from "../components/Container.jsx";
import {ChevronRight, Plus, Trash2, Loader2} from "lucide-react";
import {AddVehicle} from "../components/AddVehicle.jsx";

export const VehiclesPage = () => {

    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [triggerAddVehicle, setTriggerAddVehicle] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [explodingId, setExplodingId] = useState(null)

    const location = useLocation()

    useEffect(() => {
        if (location?.state !==undefined) {
            setVehicles((prev) => [...prev ,location.state ])
            setTriggerAddVehicle(false)
        }
    }, [location?.state])



    const [error, setError] = useState({
        error: false,
        message: ""
    })

    const handleDeleteVehicle = async (vehicleId) => {
        if (!vehicleId) return
        if (deletingId) return

        try {
            setDeletingId(vehicleId)
            setExplodingId(vehicleId)

            const res = await vehicleApi.deleteVehicle(vehicleId)

            if (!res || !res?.data || res?.data?.statusCode !== 200) {
                setExplodingId(null)
                setDeletingId(null)
                setError({
                    error: true,
                    message: res?.data?.message || "could not delete vehicle"
                })
                return
            }

            setTimeout(() => {
                setVehicles((prev) => (prev || []).filter((v) => v?._id !== vehicleId))
                setExplodingId(null)
                setDeletingId(null)
            }, 520)
        } catch (e) {
            setExplodingId(null)
            setDeletingId(null)
            setError({
                error: true,
                message: e?.response?.data?.message || e?.message || "An error occurred while deleting vehicle"
            })
        }
    }

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
                        <>
                            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-200">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-100">No vehicles yet</p>
                                        <p className="mt-1 text-sm leading-relaxed text-zinc-400">Add a vehicle to generate a QR and receive alerts.</p>
                                    </div>
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => setTriggerAddVehicle(true)}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-sky-500 px-4 py-3.5 text-center text-sm font-extrabold tracking-wide text-zinc-950 shadow-[0_18px_55px_-25px_rgba(56,189,248,0.80)] transition active:scale-[0.985]"
                                >
                                    <span className="pointer-events-none absolute -inset-10 rounded-[26px] bg-[radial-gradient(220px_120px_at_20%_0%,rgba(255,255,255,0.22),transparent_60%),radial-gradient(240px_140px_at_80%_10%,rgba(56,189,248,0.45),transparent_60%),radial-gradient(240px_140px_at_40%_110%,rgba(16,185,129,0.28),transparent_60%)] opacity-75 blur-2xl" />
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-zinc-950/18" />
                                    <span className="pointer-events-none absolute -inset-[2px] rounded-[18px] opacity-90">
                                        <span className="absolute inset-0 rounded-[18px] bg-[conic-gradient(from_var(--a),rgba(255,255,255,0.20),rgba(56,189,248,0.95),rgba(16,185,129,0.80),rgba(255,255,255,0.18))] animate-vehicular-border-spin" />
                                        <span className="absolute inset-[2px] rounded-[16px] bg-sky-500" />
                                    </span>
                                    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-90">
                                        <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent animate-vehicular-shimmer" />
                                    </span>

                                    <span className="relative inline-flex items-center justify-center gap-2">
                                        <span className="grid h-7 w-7 place-items-center rounded-xl bg-zinc-950/15 ring-1 ring-zinc-950/20">
                                            <Plus size={16} />
                                        </span>
                                        Add Vehicle
                                    </span>
                                </button>

                                {triggerAddVehicle ? (
                                    <div className="mt-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setTriggerAddVehicle(false)}
                                                className="group relative inline-flex items-center gap-2 rounded-full bg-zinc-900/40 px-3 py-2 text-xs font-semibold text-zinc-200 ring-1 ring-white/10 transition active:scale-[0.98]"
                                            >
                                                <span className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(120px_60px_at_30%_0%,rgba(56,189,248,0.25),transparent_60%),radial-gradient(120px_60px_at_80%_100%,rgba(244,63,94,0.18),transparent_60%)] opacity-0 blur-xl transition duration-300 group-hover:opacity-100" />
                                                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-80">
                                                    <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent animate-vehicular-shimmer" />
                                                </span>
                                                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-zinc-950/40 ring-1 ring-white/10">
                                                    <span className="text-base leading-none">←</span>
                                                </span>
                                                <span className="relative">Back</span>
                                            </button>
                                        </div>
                                        <AddVehicle triggerAddVehicle={triggerAddVehicle} setTriggerAddVehicle={setTriggerAddVehicle} />
                                    </div>
                                ) : null}
                            </div>
                        </>
                    )}

                    {vehicles && vehicles?.length > 0 && (
                        <div className="mt-5 space-y-3">
                            {vehicles.map((vehicle , index) => (
                                <div key={vehicle?._id || index}>
                                    <div className={`group relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/55 shadow-[0_18px_60px_-44px_rgba(0,0,0,0.95)] transition duration-200 ${explodingId === vehicle?._id ? "animate-vehicular-destroy" : "active:scale-[0.99]"}`}>
                                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                                            <div className="absolute -inset-10 bg-[radial-gradient(420px_220px_at_30%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(380px_220px_at_80%_15%,rgba(16,185,129,0.10),transparent_55%)]" />
                                        </div>

                                        <Link
                                            to={`/vehicleStatus/${vehicle?._id}`}
                                            className="block"
                                        >
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
                                        </Link>

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

                                                <div className="flex items-center gap-2">
                                                    {vehicle?.isActive !== undefined ? (
                                                        <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${vehicle.isActive ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20" : "bg-rose-500/10 text-rose-200 ring-rose-500/20"}`}>
                                                            {vehicle.isActive ? "Active" : "Inactive"}
                                                        </div>
                                                    ) : null}

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleDeleteVehicle(vehicle?._id)
                                                        }}
                                                        disabled={deletingId === vehicle?._id}
                                                        className={`relative mt-1 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border text-sm font-semibold transition active:scale-[0.98] ${deletingId === vehicle?._id ? "border-rose-500/25 bg-rose-500/10 text-rose-200" : "border-white/10 bg-zinc-950/35 text-zinc-200 hover:border-rose-400/25 hover:bg-rose-500/10 hover:text-rose-200"}`}
                                                        aria-label="Delete vehicle"
                                                    >
                                                        <span className="pointer-events-none absolute -inset-8 bg-[radial-gradient(80px_60px_at_50%_20%,rgba(244,63,94,0.18),transparent_65%)] opacity-80" />
                                                        {deletingId === vehicle?._id ? (
                                                            <Loader2 className="relative h-4.5 w-4.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="relative h-4.5 w-4.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <Link to={`/vehicleStatus/${vehicle?._id}`} className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200">
                                                    Tap to view status • QR • images
                                                </Link>
                                                <ChevronRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-200" />
                                            </div>
                                        </div>
                                    </div>
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
