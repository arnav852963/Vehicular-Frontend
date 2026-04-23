import React from "react";
import {useSelector} from "react-redux";
import { Home, Car, MessageSquare  , CircleUserRound} from 'lucide-react';
import {NavLink} from "react-router-dom";
export const BottomTabs = () => {


    const authStatus = useSelector((state)=>state?.auth?.isAuthenticated)

    const navItems = [
        {
            name: 'Home',
            slug: "/",
            active: authStatus,
            icon:<Home size={20}/>

        },

        {
            name: "Vehicle",
            slug: "/vehicle",
            active: authStatus,
            icon: <Car size={20}/>
        },
        {
            name: "Chats",
            slug: "/chats",
            active: authStatus,
            icon: <MessageSquare size={20}/>
        },
        {
            name: "Profile",
            slug: "/profile",
            icon: <CircleUserRound size={20}/>,
            active: authStatus,
        },
    ]



    return (
        <>
        <div className="fixed inset-x-0 bottom-0 z-50">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            <nav className="relative mx-auto max-w-md px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
                <div className="relative flex items-stretch justify-between gap-2 rounded-[1.65rem] border border-zinc-800/70 bg-zinc-950/70 p-2 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.95)] backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/55">
                    <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] bg-[radial-gradient(420px_160px_at_20%_0%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(380px_160px_at_80%_0%,rgba(16,185,129,0.08),transparent_55%)]" />
                    {navItems.map((item)=>{
                        return (
                            <div key={item.slug} className="flex-1">
                                {item.active && (
                                    <NavLink
                                        to={item.slug}
                                        className={({ isActive }) =>
                                            [
                                                "group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2",
                                                "text-[11px] font-semibold transition duration-200",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-0",
                                                "active:scale-[0.98]",
                                                isActive
                                                    ? "text-amber-300"
                                                    : "text-zinc-300 hover:bg-zinc-900/35 hover:text-zinc-100",
                                            ].join(" ")
                                        }
                                    >
                                        <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-200 group-[.active]:opacity-100">
                                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-400/15 via-amber-400/8 to-transparent" />
                                            <span className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/20" />
                                            <span className="absolute -inset-6 rounded-[28px] bg-[radial-gradient(120px_70px_at_50%_10%,rgba(251,191,36,0.22),transparent_60%)]" />
                                        </span>

                                        <span className="relative grid h-9 w-9 place-items-center rounded-2xl text-zinc-200 transition duration-200 group-[.active]:text-amber-300">
                                            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-zinc-900/0 transition duration-200 group-hover:bg-zinc-900/35 group-[.active]:bg-zinc-900/55" />
                                            <span className="relative">
                                                {item.icon}
                                            </span>
                                            <span className="pointer-events-none absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-400 opacity-0 shadow-[0_0_0_7px_rgba(251,191,36,0.12)] transition group-[.active]:opacity-100" />
                                        </span>
                                        <span className="leading-none tracking-tight">
                                            {item.name}
                                        </span>
                                    </NavLink>
                                )}
                            </div>
                        )
                    })}
                </div>
            </nav>
        </div>



        </>
    )
}


