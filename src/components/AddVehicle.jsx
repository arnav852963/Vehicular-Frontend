import React, {useState} from "react";

import {useForm} from "react-hook-form";
import {Input} from "./Input.jsx";
import {Select} from "./Select.jsx";
import {vehicleApi} from "../api/vehicle.js";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";
import {Bike, Bus, Car, Truck, Shapes} from "lucide-react";

export const AddVehicle = () => {
    const {register , handleSubmit} = useForm();
    
    const navigate =  useNavigate()

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

const options = ["CAR", "MOTORCYCLE", "TRUCK", "BUS", "OTHER"]
    

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

       console.log( Object.fromEntries(formData))
        
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
            
            
            navigate('/vehicle')
            
            
            
            
            
            
            
            
        } catch (e) {
            
            setError({error: true, message: "An error occurred while adding vehicle"})
            setLoading(false)
            toast(<Notification 
             message={e.message || "An error occurred while adding vehicle"}
            
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
                    <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6">
                        <div className="space-y-4">
                            <Select
                                options={options}
                                label="Vehicle Type"
                                {...register("vehicleType" , {required:true})}
                            />

                            <Input
                                label="Plate Number"
                                type="text"
                                placeholder="Enter plate number"
                                {...register("plateNumber" , {required:true})}
                            />

                            <Input
                                type="text"
                                label="Describe your vehicle"
                                placeholder="Describe your vehicle in one sentence"
                                {...register("description" , {required:true})}
                            />

                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-3">
                                <Input
                                    type="file"
                                    label="Upload Vehicle Image"
                                    accept="image/*"
                                    multiple
                                    {...register("vehicleImages" , {required:true ,validate: (value)=> {

                                        if(value.length>4) return "You can upload up to 4 images"
                                        return true
                                        } })}
                                />
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
