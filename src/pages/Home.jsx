import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {connectSocket} from "../connection.js";
import {toast} from "react-toastify";
import {Link, useNavigate} from "react-router-dom";
import {Notification} from "../components/Notification.jsx";
import {vehicleApi} from "../api/vehicle.js";
import {addVehicle} from "../store/vehicleSlice.js";
import {userApi} from "../api/user.js";
import {Plus} from "lucide-react"
import {AddVehicle} from "../components/AddVehicle.jsx";
import {Container} from "../components/Container.jsx";

export const HomePage = () => {

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
        <div className="min-h-dvh bg-zinc-950 text-zinc-100 px-4 py-6">
            <div className="mx-auto w-full max-w-md">
                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-rose-200/90">Something went wrong</p>
                            <h1 className="mt-1 text-base font-semibold text-zinc-100">{error.message}</h1>
                        </div>
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
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
        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(800px_500px_at_50%_120%,rgba(16,185,129,0.10),transparent_55%)]" />

            <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-5">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-zinc-400">Dashboard</p>
                        <h1 className="mt-1 text-2xl font-semibold leading-tight">
                            Welcome to <span className="text-sky-300">vehicular</span>
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                            Manage your vehicles and respond fast when someone scans your QR.
                        </p>
                    </div>

                    <button
                        onClick={()=> setTriggerAddVehicle(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 shadow-[0_10px_30px_-18px_rgba(56,189,248,0.45)] active:scale-[0.99]"
                    >
                        <Plus size={18} />
                        Vehicle
                    </button>
                </header>

                <section className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
                        <p className="text-xs font-medium text-zinc-400">Vehicles</p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-100">{vehicles.length}</p>
                        <p className="mt-1 text-xs text-zinc-500">Registered plates</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
                        <p className="text-xs font-medium text-zinc-400">Active chats</p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-100">{chats.length}</p>
                        <p className="mt-1 text-xs text-zinc-500">Open conversations</p>
                    </div>
                </section>

                <section className="mt-4 rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-zinc-100">Quick actions</p>
                            <p className="mt-1 text-xs text-zinc-500">Jump to the most common tasks</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/vehicle"
                                className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-medium text-zinc-200"
                            >
                                Vehicles
                            </Link>
                            <Link
                                to="/chats"
                                className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-medium text-zinc-200"
                            >
                                Chats
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mt-5">
                    {!vehicles.length && (
                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">Add your first vehicle</p>
                                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                                        Once added, you can generate a QR and start receiving anonymous alerts.
                                    </p>
                                </div>
                                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                            </div>

                            <button
                                onClick={()=> setTriggerAddVehicle(true)}
                                className="mt-4 w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-[0_14px_40px_-20px_rgba(56,189,248,0.60)] active:scale-[0.99]"
                            >
                                Add your first vehicle
                            </button>
                        </div>
                    )}
                </section>

                {!!vehicles.length && (
                    <section className="mt-5">
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_280px_at_20%_0%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(520px_260px_at_85%_20%,rgba(16,185,129,0.08),transparent_60%)]" />
                            <div className="pointer-events-none absolute inset-0 opacity-80 motion-reduce:hidden">
                                <div className="animate-vehicular-shimmer absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            </div>

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">You’re all set</p>
                                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                                        Keep your phone handy — alerts and replies live here.
                                    </p>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                                    <span className="text-xs font-medium text-zinc-400">Ready</span>
                                </div>
                            </div>

                            <div className="relative mt-4 grid grid-cols-3 gap-3">
                                <div className="animate-vehicular-float rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-3 motion-reduce:animate-none">
                                    <p className="text-[11px] font-medium text-zinc-400">Tip</p>
                                    <p className="mt-1 text-xs text-zinc-200">Print QR in high contrast</p>
                                </div>
                                <div className="animate-vehicular-float rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-3 [animation-delay:220ms] motion-reduce:animate-none">
                                    <p className="text-[11px] font-medium text-zinc-400">Tip</p>
                                    <p className="mt-1 text-xs text-zinc-200">Keep chats short & clear</p>
                                </div>
                                <div className="animate-vehicular-float rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-3 [animation-delay:440ms] motion-reduce:animate-none">
                                    <p className="text-[11px] font-medium text-zinc-400">Tip</p>
                                    <p className="mt-1 text-xs text-zinc-200">Reply fast to reduce stress</p>
                                </div>
                            </div>

                            <div className="relative mt-4">
                                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/30 px-4 py-3">
                                    <div className="pointer-events-none absolute inset-0 opacity-70 motion-reduce:hidden">
                                        <div className="animate-vehicular-shimmer absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-sky-300/10 to-transparent" />
                                    </div>
                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <span className="absolute -inset-2 rounded-full bg-sky-500/10 blur-md motion-reduce:hidden" />
                                                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-200">
                                                    <span className="text-base">@</span>
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-100">Email backup alerts</p>
                                                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                                                    If you miss a ping here, we’ll also notify you on email.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="relative inline-flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/70 opacity-60 motion-reduce:hidden" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-400">On</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {triggerAddVehicle && (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_-20px_60px_-35px_rgba(0,0,0,0.95)]">
                            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-800" />
                            <AddVehicle/>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Container>

    ) : (
        <Container>

        <div className="min-h-dvh bg-zinc-950 text-zinc-100 px-4 py-8">
            <div className="mx-auto w-full max-w-md">
                <div className="animate-pulse rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5">
                    <div className="h-4 w-24 rounded bg-zinc-800" />
                    <div className="mt-3 h-7 w-56 rounded bg-zinc-800" />
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="h-20 rounded-2xl bg-zinc-900" />
                        <div className="h-20 rounded-2xl bg-zinc-900" />
                    </div>
                    <div className="mt-4 h-12 rounded-2xl bg-zinc-900" />
                </div>
                <p className="mt-4 text-center text-sm text-zinc-500">Loading…</p>
            </div>
        </div>

        </Container>


    )
}
