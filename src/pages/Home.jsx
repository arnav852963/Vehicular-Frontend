import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {connectSocket} from "../connection.js";
import {toast} from "react-toastify";
import {Link, useNavigate} from "react-router-dom";
import {Notification} from "../components/Notification.jsx";
import {vehicleApi} from "../api/vehicle.js";
import {addVehicle} from "../store/vehicleSlice.js";
import {userApi} from "../api/user.js";
import {Plus, ArrowDown} from "lucide-react";
import {Vehicle3DHub} from "../components/Vehicle3DHub.jsx";
import {AddVehicle} from "../components/AddVehicle.jsx";
import {Container} from "../components/Container.jsx";
import {useTheme} from "../context/ThemeContext.jsx";

export const HomePage = () => {
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    const user = useSelector((state) => state.auth.userInfo)

    const [vehicles, setVehicles] = useState([])
    const [error, setError] = useState({
        error: false,
        message: ""
    })
    const [loading, setLoading] = useState(true)

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const [chats, setChats] = useState([])

    const [triggerAddVehicle, setTriggerAddVehicle] = useState(false)









    useEffect(()=>{



        setLoading(true)

        ;(async ()=> {
            try {


            const [getVehicles , chats] = await Promise.all([ vehicleApi.getUserVehicles()  , userApi.getUserChats()] )
            if (!getVehicles || !getVehicles?.data || !getVehicles?.data?.data || getVehicles?.data?.statusCode !== 200) {
                setError({
                    error: true,
                    message: getVehicles?.data?.message || "could not fetch vehicles hey  load"
                })
                setLoading(false)
                return
            }

            setVehicles(getVehicles?.data?.data)
            dispatch(addVehicle(getVehicles?.data?.data))


                if(!chats || !chats?.data || !chats?.data?.data || chats?.data?.statusCode !== 200){
                    setError({
                        error:true,
                        message:"could not fetch chats"
                    })

                    setLoading(false)

                    return
                }

                setChats(chats?.data?.data)





                setLoading(false)

        } catch (e) {


                setError({
                    error: true,
                    message: e?.response?.data?.message  || "could not fetch vehicles daimmm "
                })
                setLoading(false)
                }




        })()



    } , [dispatch])




useEffect(() => {


    if(!user && !loading){

        navigate('/signup')



    }



} , [user , loading , navigate])

    if(error && error?.error){

        return (
            <Container>
            <div className="min-h-dvh bg-transparent text-slate-100 px-4 py-6">
                <div className="mx-auto w-full max-w-md">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-lg backdrop-blur-md">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-rose-300">Something went wrong</p>
                                <h1 className="mt-1 text-base font-semibold text-slate-100">{error.message}</h1>
                            </div>
                            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-400">
                            Please refresh and try again. If this keeps happening, check your network or sign in again.
                        </p>
                    </div>
                </div>
            </div>


        </Container>
        )
    }








    return !loading ?(

        <Container>
        <div className="min-h-dvh bg-transparent text-slate-100">

            <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-5">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-400">Dashboard</p>
                        <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-50">
                            Welcome to <span className="text-indigo-400">Vehicular</span>
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                            Manage your vehicles and respond fast when someone scans your QR.
                        </p>
                    </div>

                    <button
                        onClick={()=> setTriggerAddVehicle(true)}
                        className={`group relative inline-flex items-center gap-2 rounded-full px-4.5 py-2.5 text-sm font-bold shadow-md transition active:scale-[0.985] ${
                            isBeige
                                ? "bg-amber-700 hover:bg-amber-800 text-amber-50 shadow-amber-900/10"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/20"
                        }`}
                    >
                        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
                            <Plus size={16} className="relative" />
                        </span>
                        <span className="relative">Vehicle</span>
                    </button>
                </header>

                <section className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-xs font-medium text-slate-400">Vehicles</p>
                        <p className="mt-1 text-3xl font-bold text-slate-100">{vehicles.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Registered plates</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-xs font-medium text-slate-400">Active chats</p>
                        <p className="mt-1 text-3xl font-bold text-slate-100">{chats.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Open conversations</p>
                    </div>
                </section>

                <section className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-100">Quick actions</p>
                            <p className="mt-1 text-xs text-slate-400">Jump to the most common tasks</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/vehicle"
                                className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm transition hover:bg-slate-700/60"
                            >
                                Vehicles
                            </Link>
                            <Link
                                to="/chats"
                                className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm transition hover:bg-slate-700/60"
                            >
                                Chats
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {!vehicles.length && (
                        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-800/40 p-6 shadow-lg backdrop-blur-md">
                            
                            <div className="relative flex flex-col items-center text-center">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/25">
                                    <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-md opacity-60" />
                                    <span className="relative h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)] animate-pulse" />
                                </div>
                                
                                <h2 className="text-lg font-semibold text-slate-100">Add your first vehicle</h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-[280px]">
                                    Once added, you can generate a QR and start receiving anonymous alerts.
                                </p>
                            </div>

                            <div className="relative mt-6 mb-3 flex flex-col items-center justify-center animate-vehicular-float motion-reduce:animate-none">
                                <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Get Started Here</span>
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20">
                                    <ArrowDown size={14} className="text-indigo-400" />
                                </div>
                            </div>

                            <button
                                onClick={()=> setTriggerAddVehicle(true)}
                                className={`group relative w-full overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold tracking-wide shadow-md transition active:scale-[0.985] ${
                                    isBeige
                                        ? "bg-amber-700 hover:bg-amber-800 text-amber-50"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                }`}
                            >
                                <span className="relative inline-flex items-center justify-center gap-2">
                                    <Plus size={18} />
                                    Add your first vehicle
                                </span>
                            </button>
                        </div>
                    )}
                </section>

                {!!vehicles.length && (
                    <section className="mt-5">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                            
                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">System Status: Active</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                        Your vehicles are securely monitored.
                                    </p>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-full ring-1 ring-emerald-500/20">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-medium text-emerald-300 uppercase tracking-wide">Online</span>
                                </div>
                            </div>

                            <Vehicle3DHub />

                            <div className="relative mt-4">
                                <div className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
                                                <span className="text-base">@</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">Email backup alerts</p>
                                                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                                                    If you miss a ping here, we’ll email you.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="relative inline-flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {triggerAddVehicle && (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
                        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
                            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-700" />
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
                            <AddVehicle/>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Container>

    ) : (
        <Container>
            <div className="min-h-dvh bg-transparent text-slate-100 px-4 py-8">
                <div className="mx-auto w-full max-w-md relative">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-lg backdrop-blur-sm">
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-700 animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-1/3 rounded-lg bg-slate-700 animate-pulse" />
                                    <div className="h-3 w-1/4 rounded-lg bg-slate-700/60 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="mt-2 h-20 w-full rounded-2xl bg-slate-700/50 animate-pulse" />
                            
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="h-24 rounded-2xl bg-slate-700/40 animate-pulse" />
                                <div className="h-24 rounded-2xl bg-slate-700/40 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center justify-center motion-reduce:animate-none">
                        <span className="relative flex h-3 w-3 mb-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
                        </span>
                        <p className="text-sm font-medium tracking-widest text-indigo-400 uppercase">Loading Dashboard</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
