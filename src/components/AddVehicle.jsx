import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { vehicleApi } from "../api/vehicle.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Notification } from "./Notification.jsx";
import { Camera, UploadCloud, X, ImagePlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export const AddVehicle = () => {
    const { register, handleSubmit, setValue, formState: { errors, submitCount } } = useForm();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const options = ["CAR", "MOTORCYCLE", "TRUCK", "BUS", "OTHER"];

    register("vehicleImages", {
        required: "Please upload at least one vehicle image",
        validate: (value) => {
            if (!value || value.length === 0) return "Please upload at least one image";
            if (value.length > 4) return "You can upload up to 4 images";
            return true;
        }
    });

    const previews = useMemo(() => {
        if (!selectedFiles || selectedFiles.length === 0) return [];
        return selectedFiles.map((f) => ({
            name: f?.name,
            url: URL.createObjectURL(f)
        }));
    }, [selectedFiles]);

    useEffect(() => {
        return () => {
            previews.forEach((p) => {
                try { URL.revokeObjectURL(p.url); } catch (_) {}
            });
        };
    }, [previews]);

    const syncFormFiles = (filesArray) => {
        setSelectedFiles(filesArray);
        const dataTransfer = new DataTransfer();
        filesArray.forEach(file => dataTransfer.items.add(file));
        setValue("vehicleImages", dataTransfer.files, { shouldValidate: true });
    };

    const handleFileChange = (e) => {
        const newlyChosen = Array.from(e?.target?.files || []);
        if (newlyChosen.length === 0) return;
        const combined = [...selectedFiles, ...newlyChosen].slice(0, 4);
        syncFormFiles(combined);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveFile = (indexToRemove) => {
        const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
        syncFormFiles(updated);
    };

    const addUserVehicle = async (data) => {
        if (!data) throw Error("No data provided");
        setLoading(true);
        setError(() => ({ error: false, message: "" }));

        const formData = new FormData();
        for (const key in data) {
            if (key === "vehicleImages" && (data[key] instanceof FileList || Array.isArray(data[key]))) {
                for (let i = 0; i < data[key].length; i++) {
                    formData.append("vehicleImages", data[key][i]);
                }
            } else {
                formData.append(key, data[key]);
            }
        }

        try {
            const addVehicle = await vehicleApi.createVehicle(formData);
            if (!addVehicle || !addVehicle?.data || !addVehicle?.data?.data || addVehicle?.data?.statusCode !== 201) {
                setError({ error: true, message: "Failed to add vehicle" });
                setLoading(false);
                toast(<Notification message={"An error occurred while adding vehicle"} />);
                return;
            }
            setLoading(false);
            navigate('/vehicle', { state: addVehicle?.data?.data });
        } catch (e) {
            setError({ error: true, message: "An error occurred while adding vehicle" });
            setLoading(false);
            toast(<Notification message={e?.response?.data?.message || "An error occurred while adding vehicle"} />);
        }
    };

    if (error?.error) {
        return (
            <div className="min-h-dvh bg-transparent text-slate-100">
                <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                    <div
                        className="w-full rounded-3xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-sm backdrop-blur sm:p-6"
                        role="alert"
                        aria-live="assertive"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base font-semibold tracking-tight text-slate-50">Couldn’t add vehicle</h1>
                                <p className="mt-1 break-words text-sm leading-6 text-slate-300/90">{error.message}</p>
                                <p className="mt-3 text-xs text-slate-400/90">Go back and try again.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return !loading ? (
        <div className="min-h-dvh bg-transparent text-slate-100">
            <div className="mx-auto w-full max-w-md px-4 py-6 sm:max-w-lg sm:py-10">
                <div className="mb-5">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-50">Add a vehicle</h1>
                    <p className="mt-1 text-sm text-slate-300/90">
                        Register your vehicle so strangers can contact you anonymously.
                    </p>
                </div>

                <form onSubmit={handleSubmit(addUserVehicle)} className="space-y-4">
                    {submitCount > 0 && Object.keys(errors || {}).length > 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
                            <div className="relative flex items-start gap-3">
                                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-50">Missing required info</p>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-300/90">Complete the highlighted fields to continue.</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-3xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-sm backdrop-blur sm:p-6">
                        <div className="space-y-4">
                            <div className={errors?.vehicleType ? "rounded-2xl ring-1 ring-rose-500/50" : ""}>
                                <div className={errors?.vehicleType ? "rounded-2xl bg-slate-900/60" : ""}>
                                    <Select
                                        options={options}
                                        label="Vehicle Type"
                                        {...register("vehicleType", { required: true })}
                                    />
                                </div>
                            </div>
                            {errors?.vehicleType ? (
                                <p className="-mt-2 text-xs font-medium text-rose-300">Please select a vehicle type.</p>
                            ) : null}

                            <div className={errors?.plateNumber ? "rounded-2xl ring-1 ring-rose-500/50" : ""}>
                                <div className={errors?.plateNumber ? "rounded-2xl bg-slate-900/60" : ""}>
                                    <Input
                                        label="Plate Number"
                                        type="text"
                                        placeholder="Enter plate number"
                                        {...register("plateNumber", { required: true })}
                                    />
                                </div>
                            </div>
                            {errors?.plateNumber ? (
                                <p className="-mt-2 text-xs font-medium text-rose-300">Plate number is required.</p>
                            ) : null}

                            <div className={errors?.description ? "rounded-2xl ring-1 ring-rose-500/50" : ""}>
                                <div className={errors?.description ? "rounded-2xl bg-slate-900/60" : ""}>
                                    <Input
                                        type="text"
                                        label="Describe your vehicle"
                                        placeholder="Describe your vehicle in one sentence"
                                        {...register("description", { required: true })}
                                    />
                                </div>
                            </div>
                            {errors?.description ? (
                                <p className="-mt-2 text-xs font-medium text-rose-300">Description is required.</p>
                            ) : null}

                            {/* MOBILE-FIRST CUSTOM IMAGE UPLOAD SECTION */}
                            <div className={`rounded-2xl border p-4 transition-colors ${
                                errors?.vehicleImages
                                    ? "border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/30"
                                    : isBeige
                                        ? "border-amber-200/80 bg-amber-50/50"
                                        : "border-slate-700/50 bg-slate-900/40"
                            }`}>
                                <label className={`block text-sm font-semibold mb-2.5 ${isBeige ? "text-stone-900" : "text-slate-100"}`}>
                                    Vehicle Photos <span className="text-rose-400">*</span>
                                </label>

                                {/* Hidden Input File Element */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {selectedFiles.length === 0 ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition active:scale-[0.99] ${
                                            isBeige
                                                ? "border-amber-400/60 bg-amber-100/40 hover:border-amber-500 hover:bg-amber-100/70 text-stone-800"
                                                : "border-slate-700/60 bg-slate-900/50 hover:border-indigo-500/60 hover:bg-slate-900/80 text-slate-100"
                                        }`}
                                    >
                                        <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition ${
                                            isBeige
                                                ? "border-amber-300 bg-amber-100 text-amber-800"
                                                : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                                        }`}>
                                            <Camera size={24} />
                                        </div>
                                        <p className="text-sm font-bold tracking-tight">
                                            Tap to take photo or upload
                                        </p>
                                        <p className={`mt-1 text-xs ${isBeige ? "text-stone-600" : "text-slate-400"}`}>
                                            Add 1 to 4 clear photos of your vehicle
                                        </p>
                                        <span className={`mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                                            isBeige
                                                ? "border-amber-300 bg-amber-200/60 text-amber-900"
                                                : "border-indigo-500/30 bg-indigo-500/20 text-indigo-200"
                                        }`}>
                                            <UploadCloud size={14} />
                                            Open Camera / Gallery
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-xs font-bold ${isBeige ? "text-stone-800" : "text-slate-200"}`}>
                                                Uploaded Photos ({selectedFiles.length}/4)
                                            </p>
                                            {selectedFiles.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`inline-flex items-center gap-1 text-xs font-bold transition ${
                                                        isBeige ? "text-amber-700 hover:text-amber-800" : "text-indigo-400 hover:text-indigo-300"
                                                    }`}
                                                >
                                                    <ImagePlus size={14} />
                                                    Add Photo
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {previews.map((p, idx) => (
                                                <div
                                                    key={`${p.url}-${idx}`}
                                                    className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border shadow-sm ${
                                                        isBeige ? "border-amber-300 bg-amber-100/50" : "border-slate-700 bg-slate-900/60"
                                                    }`}
                                                >
                                                    <img src={p.url} alt={p.name || "preview"} className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(idx);
                                                        }}
                                                        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition active:scale-90 hover:bg-rose-700"
                                                        title="Remove photo"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {selectedFiles.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed transition active:scale-95 ${
                                                        isBeige
                                                            ? "border-amber-300 bg-amber-100/30 text-amber-800 hover:bg-amber-100/70"
                                                            : "border-slate-700 bg-slate-900/30 text-indigo-400 hover:bg-slate-900/70"
                                                    }`}
                                                >
                                                    <ImagePlus size={18} />
                                                    <span className="text-[10px] font-bold">+ Add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {errors?.vehicleImages ? (
                                    <p className="mt-2 text-xs font-semibold text-rose-400">
                                        {errors?.vehicleImages?.message || "Please upload at least one image."}
                                    </p>
                                ) : (
                                    <p className={`mt-2.5 text-xs ${isBeige ? "text-stone-600" : "text-slate-400/90"}`}>
                                        Use clear photos so guests can easily identify your vehicle.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-slate-50 shadow-sm transition active:scale-[0.99] hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            Add Vehicle
                        </button>
                        <p className="mt-3 text-center text-xs text-slate-500/90">
                            You can manage vehicles anytime from your dashboard.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    ) : (
        <div className="min-h-dvh bg-transparent text-slate-100">
            <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                <div
                    className="w-full rounded-3xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-sm backdrop-blur sm:p-6"
                    aria-busy="true"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold tracking-tight text-slate-50">Adding vehicle…</h1>
                            <p className="mt-1 text-sm text-slate-300/90">Uploading details securely.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
