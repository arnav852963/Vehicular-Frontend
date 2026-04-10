import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {vehicleApi} from "../api/vehicle.js";
import {useDispatch} from "react-redux";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";
import {setInfoAfterScan} from "../store/scanSlice.js";
import {connectSocket} from "../connection.js";
import {Input} from "./Input.jsx";
import {Filter} from "bad-words";
const filter = new Filter();

export const GuestScan = () => {





    const {qrId} = useParams()


    const socket = useRef(null);

    const [scannedVehicleInfo, setScannedVehicleInfo] = useState(null)



    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({error: false, message: ""})
    const [other, setOther] = useState(false)
    const [message, setMessage] = useState("");

    const options =["You’re blocking me", "Lights are on", "Window is open", "Your alarm is going off", "Someone hit/scratched your vehicle", "Other"]

    const [session, setSession] = useState('')

    const dispatch = useDispatch()

    const navigate = useNavigate()





    useEffect(() => {

        setLoading(true)

        ;(async () => {
            try {
                const res = await vehicleApi.scanQr(qrId)

                if(!res || !res?.data || res?.data?.statusCode !== 200){
                    setError(()=>({ error: true ,     message:"Failed to scan QR code"}))
                    setLoading(false)
                    return
                }

                dispatch(setInfoAfterScan(res?.data?.data))
                setScannedVehicleInfo(()=> res?.data?.data?.vehicleInfo)
                setSession(()=> res?.data?.data?.guestSessionId  )

                socket.current = connectSocket({
                    guestSessionId: res?.data?.data?.guestSessionId
                })


                socket.current.on("CONNECTED_TO_SERVER" , (message)=>{

                    toast(<Notification message={message}/> )
                })

                setLoading(false)













            } catch (e){
                setError(()=>({ error: true ,     message:"An error occurred while scanning QR code " + e.message}))
                setLoading(false)

            }


        })()









        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };




    }, []);







const handleOnclickOption = (option) => {

    if (option === "Other") {
        setOther(true)
        return
    }



    socket.current.timeout(5000).emit("client_action" , {
        type:"TRIGGER_ALERT",
        payload: {
            text:option,
        }
    } , (error  , receit) =>{
        if(error) {
            setError(() => ({error: true, message: "Failed to send alert " + error.message}))
            toast(<Notification message={"Failed to send alert " + error.message}/>)
            return
        }




        if(receit.success){
            navigate(`/guest/chat/${session}`)


        }



    })

}


const handleOther = () => {

    if(!message.trim()) {
        toast(<Notification message={"Please enter a message"}/>)
        return
    }

    const cleanMessage = filter.clean(message)

    socket.current.timeout(5000).emit("client_action" , {
        type:"TRIGGER_ALERT",
        payload: {
            text: cleanMessage,
        }
    } , (error  , receit) =>{
        if(error) {
            setError(() => ({error: true, message: "Failed to send alert " + error.message}))
            toast(<Notification message={"Failed to send alert " + error.message}/>)
            return
        }




        if(receit.success){

            navigate(`/guest/chat/${session}`)
        }



    })


}

if(error?.error) {
    return (
        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
            <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                <div
                    className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h1 className="text-base font-semibold tracking-tight text-zinc-50">Couldn’t open this vehicle</h1>
                            <p className="mt-1 text-sm leading-6 text-zinc-300/90 break-words">{"error occured " + error.message}</p>
                            <p className="mt-3 text-xs text-zinc-400/90">
                                Please rescan the QR or try again in a moment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

    return !loading ? (
        <div className="mx-auto w-full max-w-md px-4 pb-24 pt-3 sm:max-w-lg">
            <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-50">Send an alert</h1>
                        <p className="mt-1 text-sm leading-6 text-zinc-300/90">
                            Choose a quick message so the owner can respond fast.
                        </p>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2">
                        <p className="text-[10px] font-medium tracking-wide text-zinc-400">PLATE</p>
                        <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-100">
                            {scannedVehicleInfo?.plateNumber}
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="grid grid-cols-1 gap-3">
                        {options.map((option, index) => {
                            const isOther = option === "Other";
                            const accent =
                                option === "You’re blocking me"
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-50"
                                    : option === "Lights are on" || option === "Window is open"
                                        ? "border-amber-400/30 bg-amber-400/10 text-amber-50"
                                        : option === "Someone hit/scratched your vehicle" || option === "Your alarm is going off"
                                            ? "border-rose-500/25 bg-rose-500/10 text-rose-50"
                                            : "border-zinc-800/70 bg-zinc-950/50 text-zinc-100";

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOnclickOption(option)}
                                    value={option}
                                    className={
                                        "group w-full rounded-2xl border px-4 py-4 text-left shadow-sm outline-none transition active:scale-[0.99] " +
                                        "focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-0 " +
                                        (isOther
                                            ? "border-zinc-800/70 bg-zinc-950/60 text-zinc-100 hover:bg-zinc-900/40"
                                            : accent + " hover:bg-zinc-900/30")
                                    }
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold leading-6 tracking-tight">{option}</p>
                                            <p className="mt-1 text-xs leading-5 text-zinc-300/80">
                                                Tap to notify the owner.
                                            </p>
                                        </div>

                                        <div
                                            className={
                                                "mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl ring-1 transition " +
                                                (isOther
                                                    ? "bg-zinc-900/40 ring-zinc-800/70"
                                                    : option === "You’re blocking me" || option === "Someone hit/scratched your vehicle" || option === "Your alarm is going off"
                                                        ? "bg-rose-500/10 ring-rose-500/20"
                                                        : option === "Lights are on" || option === "Window is open"
                                                            ? "bg-amber-400/10 ring-amber-400/20"
                                                            : "bg-zinc-900/40 ring-zinc-800/70")
                                            }
                                            aria-hidden="true"
                                        >
                                            <span
                                                className={
                                                    "h-2.5 w-2.5 rounded-full " +
                                                    (isOther
                                                        ? "bg-zinc-300/70"
                                                        : option === "You’re blocking me" || option === "Someone hit/scratched your vehicle" || option === "Your alarm is going off"
                                                            ? "bg-rose-500"
                                                            : option === "Lights are on" || option === "Window is open"
                                                                ? "bg-amber-400"
                                                                : "bg-zinc-400")
                                                }
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {other && (
                    <div className="mt-6">
                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-3">
                            <Input
                                label={"Enter your message"}
                                placeholder={"Keep it short and clear"}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleOther}
                            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-cyan-400 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                        >
                            Send alert
                        </button>

                        <p className="mt-2 text-xs text-zinc-400/90">
                            Profanity is filtered. Don’t include phone numbers or personal info.
                        </p>
                    </div>
                )}

                {!other && (
                    <p className="mt-6 text-xs text-zinc-400/90">
                        This message reaches the owner anonymously. No phone numbers are shared.
                    </p>
                )}
            </div>
        </div>
    ) : (
        <div className="min-h-[60dvh] bg-transparent text-zinc-100">
            <div className="mx-auto w-full max-w-md px-4 py-10 sm:max-w-lg">
                <div
                    className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6"
                    aria-busy="true"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-base font-semibold tracking-tight text-zinc-50">Opening vehicle…</h1>
                            <p className="mt-1 text-sm leading-6 text-zinc-300/90">
                                Fetching details and securing your guest session.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
