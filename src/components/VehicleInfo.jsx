import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {vehicleApi} from "../api/vehicle.js";
import {MyVehicles} from "./MyVehicles.jsx";
import {Qr} from "./Qr.jsx";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";


const base64ToBlob = (base64, contentType = "image/png") => {

    const cleaned = base64.includes("base64,") ? base64.split("base64,")[1] : base64;

    const byteCharacters = atob(cleaned);
    const byteArrays = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
};



export const VehicleInfo = () => {

    const [vehicleInfo, setVehicleInfo] = useState({})
    const [activationLoading, setActivationLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({
        error: false,
        message: ""
    })
    const [activationQr, setActivationQr] = useState(true)

    const {vehicleId} = useParams();
    const [qr, setQr] = useState(null)
    const [showQr, setShowQr] = useState(false)

    const handleDownloadQr = () => {
        if (!qr) return

        const mimeMatch = typeof qr === "string" ? qr.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/) : null
        const mime = mimeMatch?.[1] || "image/png"

        const blob = base64ToBlob(qr, mime)
        const plate = vehicleInfo?.plateNumber ? String(vehicleInfo.plateNumber).replace(/\s+/g, "") : null
        const qrId = vehicleInfo?.qrId ? String(vehicleInfo.qrId).replace(/\s+/g, "") : null
        const filename = `vehicular-qr-${plate || qrId || "vehicle"}.png`

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }


    const handleQrActivation =async ()=>{
        setActivationLoading(true)

        try{

            const res = await vehicleApi.activateDeactivateQr(vehicleId , activationQr)

            if(!res || !res?.data || res?.data?.data.toString() === undefined || res?.data?.statusCode !== 200){
               toast(<Notification message={ activationQr ?   "failed to deactivate Qr " : "failed to activate Qr"} />)
                setActivationLoading(false)
                return
            }
            setActivationQr(res?.data?.data)
            setActivationLoading(false)

        } catch (e){

            toast(<Notification message={ activationQr ?   "failed to deactivate Qr " : "failed to activate Qr"} />)
            setActivationLoading(false)



        }



    }


    useEffect(() => {
        ;(async ()=>{

            try {


                const res = await vehicleApi.getVehicle(vehicleId )

                if (!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 200) {
                    setError({error: true, message: "Failed to fetch vehicle data"})
                    setLoading(false)
                    return

                }
                setVehicleInfo(res?.data?.data?.vehicle)
                setQr(res?.data?.data?.qrImage)
                setActivationQr(res?.data?.data?.vehicle?.activateQr)
                setLoading(false)
            } catch (e) {
                setError({error: true, message: e.message || "An error occurred while fetching vehicle data"})
                setLoading(false)
            }




        })()
    }, []);




            if (loading) {
                return (
                    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%)]" />
                        <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-5">
                            <div className="animate-pulse rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5">
                                <div className="h-4 w-24 rounded bg-zinc-800" />
                                <div className="mt-3 h-7 w-44 rounded bg-zinc-800" />
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="h-20 rounded-2xl bg-zinc-900" />
                                    <div className="h-20 rounded-2xl bg-zinc-900" />
                                </div>
                                <div className="mt-4 h-52 rounded-2xl bg-zinc-900" />
                            </div>
                            <p className="mt-4 text-center text-sm text-zinc-500">Loading vehicle…</p>
                        </div>
                    </div>
                )
            }

            if (error?.error) {
                return (
                    <div className="min-h-dvh bg-zinc-950 text-zinc-100 px-4 py-6">
                        <div className="mx-auto w-full max-w-md">
                            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 shadow-[0_14px_40px_-28px_rgba(244,63,94,0.45)]">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-rose-200/80">Error</p>
                                        <p className="mt-1 text-base font-semibold text-rose-100">{error.message || "Failed to fetch vehicle data"}</p>
                                    </div>
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                                </div>
                                <p className="mt-3 text-sm text-zinc-400">
                                    Please refresh and try again.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(800px_500px_at_50%_120%,rgba(16,185,129,0.08),transparent_55%)]" />

                    <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-5">
                        <header className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium tracking-wide text-zinc-400">Vehicle</p>
                                <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">
                                    {vehicleInfo?.plateNumber ? (
                                        <span className="text-sky-300">{vehicleInfo.plateNumber}</span>
                                    ) : (
                                        "Vehicle Info"
                                    )}
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                    Details for your registered vehicle.
                                </p>
                            </div>

                            {vehicleInfo?.isActive !== undefined ? (
                                <div className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${vehicleInfo.isActive ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20" : "bg-rose-500/10 text-rose-200 ring-rose-500/20"}`}>
                                    {vehicleInfo.isActive ? "Active" : "Inactive"}
                                </div>
                            ) : null}
                        </header>

                        <section className="mt-5 grid grid-cols-2 gap-3">
                            {vehicleInfo?.vehicleType ? (
                                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
                                    <p className="text-xs font-medium text-zinc-400">Type</p>
                                    <p className="mt-1 text-base font-semibold text-zinc-100">{vehicleInfo.vehicleType}</p>
                                </div>
                            ) : null}

                            {vehicleInfo?.qrId ? (
                                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
                                    <p className="text-xs font-medium text-zinc-400">QR ID</p>
                                    <p className="mt-1 font-mono text-sm font-semibold text-zinc-100">{vehicleInfo.qrId}</p>
                                </div>
                            ) : null}
                        </section>

                        {vehicleInfo?.description ? (
                            <section className="mt-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Description</p>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-300">{vehicleInfo.description}</p>
                            </section>
                        ) : null}



                        {(vehicleInfo?.createdAt || vehicleInfo?.updatedAt) ? (
                            <section className="mt-3 grid grid-cols-2 gap-3">
                                {vehicleInfo?.createdAt ? (
                                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                        <p className="text-xs font-medium text-zinc-400">Created</p>
                                        <p className="mt-1 text-xs font-medium text-zinc-200">{new Date(vehicleInfo.createdAt).toLocaleString()}</p>
                                    </div>
                                ) : null}
                                {vehicleInfo?.updatedAt ? (
                                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                        <p className="text-xs font-medium text-zinc-400">Updated</p>
                                        <p className="mt-1 text-xs font-medium text-zinc-200">{new Date(vehicleInfo.updatedAt).toLocaleString()}</p>
                                    </div>
                                ) : null}
                            </section>
                        ) : null}

                        {Array.isArray(vehicleInfo?.vehicleImage) ? (
                            <div className="mt-6">
                                <MyVehicles urls={vehicleInfo.vehicleImage} />
                            </div>
                        ) : null}

                        {qr ? (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowQr(true)}
                                    className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_-18px_rgba(34,211,238,0.45)] transition active:scale-[0.99]"
                                >
                                    Show QR (screenshot-friendly)
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="relative mx-auto w-full max-w-md px-4 pb-6">
                        <button
                            type="button"
                            onClick={handleQrActivation}
                            disabled={activationLoading}
                            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-[0_10px_34px_-20px_rgba(0,0,0,0.65)] ring-1 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${
                                activationQr
                                    ? "border border-rose-500/20 bg-rose-500/10 text-rose-100 ring-rose-500/25"
                                    : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-100 ring-emerald-500/25"
                            }`}
                        >
                            {activationLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent" />
                                    <span>{activationQr ? "Deactivating…" : "Activating…"}</span>
                                </span>
                            ) : (
                                <span>{activationQr ? "Deactivate QR" : "Activate QR"}</span>
                            )}
                        </button>
                        <p className="mt-2 text-center text-xs text-zinc-500">
                            {activationQr
                                ? "Turning this off disables new guest scans."
                                : "Turning this on allows guests to scan and contact you."}
                        </p>
                    </div>

                    {showQr && qr ? (
                        <div className="fixed inset-0 z-50">
                            <button
                                type="button"
                                aria-label="Close QR"
                                onClick={() => setShowQr(false)}
                                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            />

                            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-5">
                                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/95 p-4 shadow-[0_22px_70px_-40px_rgba(0,0,0,0.85)]">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium tracking-wide text-zinc-400">QR Code</p>
                                            <p className="mt-0.5 text-sm font-semibold text-zinc-100">Screenshot or print</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleDownloadQr}
                                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 shadow-[0_10px_30px_-22px_rgba(16,185,129,0.45)] transition active:scale-[0.99]"
                                            >
                                                Download QR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowQr(false)}
                                                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-200 transition active:scale-[0.99]"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>

                                    <Qr qr={qr} plateNumber={vehicleInfo?.plateNumber} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )




}
