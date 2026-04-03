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
            active: true,
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
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800/70 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
            <nav className="mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <div className="flex items-stretch justify-between gap-2">
                    {navItems.map((item)=>{
                        return (
                            <div key={item.slug} className="flex-1">
                                {item.active && (
                                    <NavLink
                                        to={item.slug}
                                        className={({ isActive }) =>
                                            [
                                                "group flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2",
                                                "text-xs font-medium transition",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-0",
                                                "active:scale-[0.98]",
                                                isActive
                                                    ? "bg-zinc-900/70 text-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.18)]"
                                                    : "text-zinc-300 hover:bg-zinc-900/40 hover:text-zinc-100",
                                            ].join(" ")
                                        }
                                    >
                                        <span className="grid place-items-center text-zinc-200 group-[.active]:text-amber-400">
                                            {item.icon}
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


