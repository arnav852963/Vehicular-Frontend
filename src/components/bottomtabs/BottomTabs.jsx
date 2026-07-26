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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
            <nav className="relative mx-auto max-w-md px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
                <div className="relative flex items-stretch justify-between gap-2 rounded-[1.65rem] border border-slate-700/50 bg-slate-800/80 p-2 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-slate-800/60">
                    
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
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-0",
                                                "active:scale-[0.98]",
                                                isActive
                                                    ? "text-indigo-300"
                                                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100",
                                            ].join(" ")
                                        }
                                    >
                                        <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-200 group-[.active]:opacity-100">
                                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/15 via-indigo-500/5 to-transparent" />
                                            <span className="absolute inset-0 rounded-2xl ring-1 ring-indigo-500/20" />
                                        </span>

                                        <span className="relative grid h-9 w-9 place-items-center rounded-2xl text-slate-300 transition duration-200 group-[.active]:text-indigo-300">
                                            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-slate-800/0 transition duration-200 group-hover:bg-slate-700/35 group-[.active]:bg-slate-700/50" />
                                            <span className="relative">
                                                {item.icon}
                                            </span>
                                            <span className="pointer-events-none absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-indigo-400 opacity-0 transition group-[.active]:opacity-100" />
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


