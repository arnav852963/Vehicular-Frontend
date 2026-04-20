import React from "react";
import logo from "../assets/logo.png";

export const Logo = () => {
    return (
        <>
        <div className="flex items-center gap-2 select-none">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                <img
                    src={logo}
                    alt="VehicularQR"
                    className="h-10 w-10 object-contain"
                    draggable={false}
                />
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                Vehicular
                <span className="text-cyan-400">QR</span>
            </h1>
        </div>


        </>
    )
}
