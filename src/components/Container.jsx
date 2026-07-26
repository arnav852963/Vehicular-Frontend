import React from "react";
import { BackgroundPattern } from "./BackgroundPattern.jsx";

export const Container = ({children}) => {
    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 px-4 py-10 sm:px-6">
            <BackgroundPattern />
            <div className="relative z-10 mx-auto w-full max-w-md">
                {children}
            </div>
        </div>
    )
}
