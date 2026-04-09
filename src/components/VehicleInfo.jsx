import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {vehicleApi} from "../api/vehicle.js";
import {MyVehicles} from "./MyVehicles.jsx";
import {Qr} from "./Qr.jsx";

export const VehicleInfo = () => {

    const [vehicleInfo, setVehicleInfo] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({
        error: false,
        message: ""
    })

    const {vehicleId} = useParams();


    useEffect(() => {
        ;(async ()=>{

            try {


                const res = await vehicleApi.getVehicle(vehicleId)

                if (!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 200) {
                    setError({error: true, message: "Failed to fetch vehicle data"})
                    setLoading(false)
                    return

                }
                setVehicleInfo(res?.data?.data)
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

                        {vehicleInfo?.qr ? (
                            <div className="mt-6">
                                <Qr qr={vehicleInfo.qr} plateNumber={vehicleInfo?.plateNumber} />
                            </div>
                        ) : null}
                    </div>
                </div>
            )




}
