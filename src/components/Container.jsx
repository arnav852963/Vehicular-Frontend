import React from "react";

export const Container = ({children}) => {
    return (
        <>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-6">
            <div className="mx-auto w-full max-w-md">
                {children}
            </div>
        </div>

        </>
    )
}
