import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";


export const Protected = ({children , authentication = true}) => {

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const location = useLocation()

    useEffect(() => {
        setLoading(true)
        if(authentication && isAuthenticated !==authentication) navigate("/signup" , {
            state: {
                from: location?.pathname
            },
            replace: true
        })


        setLoading(false)

    }, []);

    return !loading ? (
        <>

            {children}


        </>
    ) : (
        <>
            <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4">
                    <div
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl shadow-black/30 backdrop-blur"
                        aria-busy="true"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
                                <div className="h-full w-full animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold">Loading…</h1>
                                <p className="mt-0.5 text-xs text-zinc-400">Checking access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
