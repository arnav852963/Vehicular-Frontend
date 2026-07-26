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
                
                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <p className="text-xs font-medium tracking-wide text-slate-400">Garage</p>
                    <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-100">My <span className="text-indigo-400">Vehicles</span></h1>

                    <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 shadow-sm backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-rose-300">Error</p>
                                <p className="mt-1 text-base font-semibold text-rose-100">{error?.message || "An error occurred while fetching vehicles"}</p>
                            </div>
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                        </div>
                        <p className="mt-3 text-sm text-slate-400">Refresh the page and try again.</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
    return !loading ? (
        <Container>
            <div className="relative">
                

                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-slate-400">Garage</p>
                            <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-100">My <span className="text-indigo-400">Vehicles</span></h1>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">Tap a vehicle to open status, images and QR.</p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
                            <p className="text-[11px] font-medium text-slate-400">Total</p>
                            <p className="text-lg font-semibold text-slate-100">{vehicles.length}</p>
                        </div>
                    </div>

                    {(!vehicles || vehicles?.length === 0) && (
                        <>
                            <div className="mt-5 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">No vehicles yet</p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-400">Add a vehicle to generate a QR and receive alerts.</p>
                                    </div>
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => setTriggerAddVehicle(true)}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-indigo-500 px-4 py-3.5 text-center text-sm font-bold tracking-wide text-slate-50 shadow-md transition hover:bg-indigo-400 active:scale-[0.985]"
                                >
                                    

                                    <span className="relative inline-flex items-center justify-center gap-2">
                                        
                                        <Plus size={18} />
                                        Add Vehicle
                                    </span>
                                </button>

                                {triggerAddVehicle ? (
                                    <div className="mt-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setTriggerAddVehicle(false)}
                                                className="group relative inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-700 active:scale-[0.98]"
                                            >
                                                <span className="relative grid h-6 w-6 place-items-center rounded-full bg-slate-900 ring-1 ring-slate-700">
                                                    <span className="text-sm leading-none">←</span>
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
                                    <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/40 shadow-sm backdrop-blur-sm transition duration-200 ${explodingId === vehicle?._id ? "animate-vehicular-destroy" : "hover:bg-slate-800/60 active:scale-[0.99]"}`}>
                                        

                                        <Link
                                            to={`/vehicleStatus/${vehicle?._id}`}
                                            className="block"
                                        >
                                            <div className="relative">
                                                <div className="aspect-[16/9] w-full bg-slate-900">
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
                                                                <div className="h-10 w-10 rounded-xl bg-slate-800/60 ring-1 ring-slate-700" />
                                                                <p className="text-xs font-medium text-slate-500">No image</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                                                <div className="pointer-events-none absolute right-3 top-3 grid place-items-center">
                                                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/45 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
                                                        Open
                                                        <ChevronRight className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plate</p>
                                                    <p className="mt-1 truncate text-base font-semibold text-slate-100">
                                                        {vehicle?.plateNumber}
                                                    </p>
                                                    {vehicle?.vehicleType ? (
                                                        <p className="mt-1 text-xs text-slate-500">{vehicle.vehicleType}</p>
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
                                                        className={`relative mt-1 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border text-sm font-semibold transition active:scale-[0.98] ${deletingId === vehicle?._id ? "border-rose-500/25 bg-rose-500/10 text-rose-200" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-rose-400/25 hover:bg-rose-500/10 hover:text-rose-200"}`}
                                                        aria-label="Delete vehicle"
                                                    >
                                                        
                                                        {deletingId === vehicle?._id ? (
                                                            <Loader2 className="relative h-4.5 w-4.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="relative h-4.5 w-4.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <Link to={`/vehicleStatus/${vehicle?._id}`} className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
                                                    Tap to view status • QR • images
                                                </Link>
                                                <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
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
                
                <div className="mx-auto w-full max-w-md pb-24 pt-5 relative">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-4 w-20 rounded-lg bg-slate-700 animate-pulse" />
                            <div className="h-7 w-44 rounded-lg bg-slate-700 animate-pulse" />
                            
                            <div className="mt-4 space-y-4">
                                <div className="h-40 rounded-2xl bg-slate-700/30 ring-1 ring-slate-700/50 animate-pulse" />
                                <div className="h-40 rounded-2xl bg-slate-700/30 ring-1 ring-slate-700/50 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center justify-center motion-reduce:animate-none">
                        <span className="relative flex h-3 w-3 mb-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
                        </span>
                        <p className="text-sm font-medium tracking-widest text-indigo-400 uppercase">Loading Vehicles</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
