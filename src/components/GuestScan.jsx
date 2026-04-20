import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {vehicleApi} from "../api/vehicle.js";

import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";

import {Input} from "./Input.jsx";
import {Filter} from "bad-words";
const filter = new Filter();

export const GuestScan = () => {





    const {qrId , senderType} = useParams()



    const [scannedVehicleInfo, setScannedVehicleInfo] = useState(null)



    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({error: false, message: ""})
    const [other, setOther] = useState(false)
    const [message, setMessage] = useState("");
    const [imageData, setImageData] = useState(null)
    const [imageBlob, setImageBlob] = useState("")

    const [buttonClicked, setButtonClicked] = useState(false)

    const options =["You’re blocking me", "Lights are on", "Window is open", "Your alarm is going off", "Someone hit/scratched your vehicle", "Other"]

    const photoSectionRef = useRef(null)





    const navigate = useNavigate()

    useEffect(() => {
        if (!buttonClicked) return
        const el = photoSectionRef.current
        if (!el) return

        requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" })
        })
    }, [buttonClicked, imageBlob])


    useEffect(() => {
        setLoading(true)

        ;(async ()=>{

            try {


                const res = await vehicleApi.getVehicleByQrId(qrId)

                if (!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 200) {
                    setError({error: true, message: "Failed to fetch vehicle data"})
                    setLoading(false)
                    return

                }

                setScannedVehicleInfo(res?.data?.data)
                setLoading(false)

            } catch (e) {
                setError({error: true, message: e?.response?.data?.message  || "An error occurred while fetching vehicle data"})
                setLoading(false)

            }

        })()

    }, [qrId]);


















const handleOnclickOption = async ( ) => {
    
    setLoading(true)




        const cleanMessage = filter.clean(message)

    const formData = new FormData();
    formData.append('message' , JSON.stringify({
        senderType: "guest",
        message: cleanMessage,
        id: crypto.randomUUID()
    }))

    formData.append('captured' , imageData)

    try {
            const res = await vehicleApi.scanQr(qrId ,formData )

        if (!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 200) {
            toast(<Notification message={"Failed to send alert. Please try again."} />)
            setError({error: true, message: "Failed to send alert"})
            setLoading(false)
            return
        }
        setLoading(false)

        navigate(`/guest/chat/${res?.data?.data?.sessionId}` ,  {state: {mailInfo: res?.data?.data}})






    } catch (e) {

        toast(<Notification message={e?.response?.data?.message || e?.message || "An error occurred while sending alert. Please try again."} />)
        setError({error: true, message: e?.response?.data?.message || "An error occurred while sending alert"})
        setLoading(false)
        setLoading(false)

    }












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
                                    onClick={() => {

                                        if(option === "Other")  setOther(true);


                                       else {setMessage(option) ; setButtonClicked(true)  }}}
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
                            value={message}
                            onClick={()=> setButtonClicked(true)}
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


            <div className="mt-4">

                {buttonClicked && (
                    <div ref={photoSectionRef} className="rounded-3xl border border-zinc-800/70 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold tracking-tight text-zinc-50">Add a proof photo (optional)</h2>
                                <p className="mt-1 text-sm leading-6 text-zinc-300/90">
                                    If it’s safe, capture the issue (blocked car, lights on, damage). This helps the owner trust the alert.
                                </p>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-2">
                                <p className="text-[10px] font-medium tracking-wide text-zinc-400">TIP</p>
                                <p className="mt-0.5 text-xs font-medium text-zinc-200">No faces / no personal info</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-3">
                            <Input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) =>{

                                    setImageData(e.target.files[0])
                                    setImageBlob(URL.createObjectURL(e.target.files[0]))


                                }}
                            />

                            <p className="mt-2 text-xs text-zinc-400/90">
                                Your phone will open the camera or gallery picker.
                            </p>
                        </div>

                        {imageBlob && (
                          <div className="mt-4">
                            <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/50">
                              <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 px-3 py-2">
                                <p className="text-xs font-medium text-zinc-300">Preview</p>
                                <div className="inline-flex items-center gap-2 text-[11px] text-zinc-400">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                                  Ready to send
                                </div>
                              </div>
                              <img
                                src={imageBlob}
                                alt="Captured"
                                className="aspect-[4/3] w-full object-cover"
                              />
                            </div>

                            <p className="mt-2 text-xs text-zinc-400/90">
                              If the photo looks wrong, pick again—your latest one will replace it.
                            </p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-3">
                          <button
                            onClick={handleOnclickOption}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-cyan-400 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-60"
                          >
                            Send
                          </button>

                          <p className="text-xs text-zinc-400/90">
                            You’ll be taken to chat right after this.
                          </p>
                        </div>
                      </div>
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
