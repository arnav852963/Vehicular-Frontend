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
    const socket = useRef(null);
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






    useEffect(() => {


        if(!user?._id)  return;
        socket.current = connectSocket({
            ownerToken: user._id
        })


        socket.current.on("ALERT" , (data)=>{
            const {sessionId} = data

            if(sessionId){

                toast(


                            <Notification  message="you have a alert. click me"  />
                 , {

                        autoClose: false,
                        closeOnClick:true,
                        onClick: ()=> navigate(`/chat/${sessionId}`)
                    })


            }




        })

        return () => {
            if(socket.current){
                socket.current.disconnect();
            }
        }


    }, [user?._id]);


    useEffect(()=>{



        setLoading(true)

        ;(async ()=> {
            try {


            const [getVehicles , chats] = await Promise.all([ vehicleApi.getUserVehicles()  , userApi.getUserChats()] )
            if (!getVehicles || !getVehicles?.data || !getVehicles?.data?.data || getVehicles?.data?.statusCode !== 200) {
                setError({
                    error: true,
                    message: getVehicles?.data?.message || "could not fetch vehicles"
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
                    message: e?.response?.data?.message || "could not fetch vehicles"
                })
                setLoading(false)
                }




        })()



    } , [dispatch])




useEffect(() => {


    if(!user && !loading){

        navigate('/signin')



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
                                to="/vehicles"
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
