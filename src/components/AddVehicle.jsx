import React, {useEffect, useMemo, useState} from "react";

import {useForm} from "react-hook-form";
import {Input} from "./Input.jsx";
import {Select} from "./Select.jsx";
import {vehicleApi} from "../api/vehicle.js";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";
import {Bike, Bus, Car, Truck, Shapes} from "lucide-react";

export const AddVehicle = () => {
    const {register , handleSubmit, formState: { errors, submitCount }} = useForm();
    
    const navigate =  useNavigate()

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

const options = ["CAR", "MOTORCYCLE", "TRUCK", "BUS", "OTHER"]

    const vehicleImagesRegister = register("vehicleImages" , {required:true ,validate: (value)=> {



            if(value.length>4) return "You can upload up to 4 images"
            return true

        } })

    const [selectedFiles, setSelectedFiles] = useState([])


    const previews = useMemo(() => {


        if (!selectedFiles || selectedFiles.length === 0) return []


        return selectedFiles.map((f) => ({


            name: f?.name,
            url: URL.createObjectURL(f)


        }))
    }, [selectedFiles])



    useEffect(() => {


        return () => {


            previews.forEach((p) => {

                try { URL.revokeObjectURL(p.url) } catch (_) {}


            })


        }
    }, [previews])
    

    const addUserVehicle = async (data) => {
        if(!data)throw Error("No data provided")

        console.log(data)
        
        setLoading(true)
        setError(()=> ({ error: false ,  message:""}))

        const formData = new FormData();

        for (const key in data) {
            if (key === "vehicleImages" && data[key] instanceof FileList) {
                for (let i = 0; i < data[key].length; i++) {
                    formData.append("vehicleImages", data[key][i]);
                }
            } else {
                formData.append(key, data[key]);
            }
        }


        
        try {
            
            const addVehicle  =  await vehicleApi.createVehicle(formData)
            
            if(!addVehicle || !addVehicle?.data || !addVehicle?.data?.data || addVehicle?.data?.statusCode !== 201){
                setError({error: true, message: "Failed to add vehicle"})
                setLoading(false)

                toast(<Notification
                    message={ "An error occurred while adding vehicle"}

                />)
                return
            }

            setLoading(false)

            navigate('/vehicle' , {state:addVehicle?.data?.data} )

            
            
            
            
            
            
            
            
        } catch (e) {
            
            setError({error: true, message: "An error occurred while adding vehicle"})
            setLoading(false)
            toast(<Notification 
             message={e?.response?.data?.message || "An error occurred while adding vehicle"}
            
            />)
            
        }



    }




if(error?.error){

    return (
        <>
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
                                <h1 className="text-base font-semibold tracking-tight text-zinc-50">Couldn’t add vehicle</h1>
                                <p className="mt-1 break-words text-sm leading-6 text-zinc-300/90">{error.message}</p>
                                <p className="mt-3 text-xs text-zinc-400/90">Go back and try again.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}





    return  !loading ? (
        <>
        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
            <div className="mx-auto w-full max-w-md px-4 py-6 sm:max-w-lg sm:py-10">
                <div className="mb-5">
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Add a vehicle</h1>
                    <p className="mt-1 text-sm text-zinc-300/90">
                        Register your vehicle so strangers can contact you anonymously.
                    </p>
                </div>

                <form onSubmit={handleSubmit(addUserVehicle)} className="space-y-4">
                    {submitCount > 0 && Object.keys(errors || {}).length > 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
                            <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-vehicular-shimmer" />
                            <div className="relative flex items-start gap-3">
                                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-zinc-50">Missing required info</p>
                                    <p className="mt-1 text-xs leading-relaxed text-zinc-300/90">Complete the highlighted fields to continue.</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6">
                        <div className="space-y-4">
                            <div className={errors?.vehicleType ? "rounded-2xl p-[1px] bg-[conic-gradient(from_var(--a),rgba(244,63,94,0.65),rgba(251,191,36,0.45),rgba(244,63,94,0.65))] animate-vehicular-border-spin" : ""}>
                                <div className={errors?.vehicleType ? "rounded-2xl bg-zinc-950/60" : ""}>
                            <Select
                                options={options}
                                label="Vehicle Type"
                                {...register("vehicleType" , {required:true})}
                            />
                                </div>
                            </div>
                            {errors?.vehicleType ? (
                                <p className="-mt-2 text-xs font-medium text-rose-200">Please select a vehicle type.</p>
                            ) : null}

                            <div className={errors?.plateNumber ? "rounded-2xl p-[1px] bg-[conic-gradient(from_var(--a),rgba(244,63,94,0.65),rgba(56,189,248,0.45),rgba(244,63,94,0.65))] animate-vehicular-border-spin" : ""}>
                                <div className={errors?.plateNumber ? "rounded-2xl bg-zinc-950/60" : ""}>
                            <Input
                                label="Plate Number"
                                type="text"
                                placeholder="Enter plate number"
                                {...register("plateNumber" , {required:true})}
                            />
                                </div>
                            </div>
                            {errors?.plateNumber ? (
                                <p className="-mt-2 text-xs font-medium text-rose-200">Plate number is required.</p>
                            ) : null}

                            <div className={errors?.description ? "rounded-2xl p-[1px] bg-[conic-gradient(from_var(--a),rgba(244,63,94,0.65),rgba(16,185,129,0.45),rgba(244,63,94,0.65))] animate-vehicular-border-spin" : ""}>
                                <div className={errors?.description ? "rounded-2xl bg-zinc-950/60" : ""}>
                            <Input
                                type="text"
                                label="Describe your vehicle"
                                placeholder="Describe your vehicle in one sentence"
                                {...register("description" , {required:true})}
                            />
                                </div>
                            </div>
                            {errors?.description ? (
                                <p className="-mt-2 text-xs font-medium text-rose-200">Description is required.</p>
                            ) : null}

                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-3">
                                <div className={errors?.vehicleImages ? "rounded-2xl p-[1px] bg-[conic-gradient(from_var(--a),rgba(244,63,94,0.65),rgba(56,189,248,0.45),rgba(244,63,94,0.65))] animate-vehicular-border-spin" : ""}>
                                    <div className={errors?.vehicleImages ? "rounded-2xl bg-zinc-950/60" : ""}>
                                        <Input
                                            type="file"
                                            label="Upload Vehicle Image"
                                            accept="image/*"
                                            multiple
                                            {...vehicleImagesRegister}
                                            onChange={(e) => {
                                                vehicleImagesRegister.onChange(e)
                                                const files = Array.from(e?.target?.files || [])
                                                setSelectedFiles(files)
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors?.vehicleImages ? (
                                    <p className="mt-2 text-xs font-medium text-rose-200">{errors?.vehicleImages?.message || "Please upload at least one image."}</p>
                                ) : null}

                                {previews.length > 0 ? (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold tracking-wide text-zinc-300">Selected</p>
                                            <p className="text-[11px] text-zinc-500">{previews.length}/4</p>
                                        </div>
                                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {previews.map((p, idx) => (
                                                <div key={`${p.url}-${idx}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40">
                                                    <img src={p.url} alt={p.name || "preview"} className="h-full w-full object-cover" />
                                                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/5 bg-zinc-950/30 p-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.12)]" />
                                        <p className="text-xs text-zinc-400">Add 1–4 clear photos. Front/side shots work best.</p>
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-zinc-400/90">
                                    Use a clear photo—helps guests confirm they scanned the right vehicle.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 transition active:scale-[0.99] hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                        >
                            Add Vehicle
                        </button>
                        <p className="mt-3 text-center text-xs text-zinc-500/90">
                            You can manage vehicles anytime from your dashboard.
                        </p>
                    </div>
                </form>
            </div>
        </div>



        </>
    ) : (
        <>
            <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                    <div
                        className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6"
                        aria-busy="true"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold tracking-tight text-zinc-50">Adding vehicle…</h1>
                                <p className="mt-1 text-sm text-zinc-300/90">Uploading details securely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
