import React from "react";
import {Link} from "react-router-dom";

export const Button = ({label="" , to }) => {
    return (
        <>

            <Link to={to} className="block w-full">
                <button
                    type="button"
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 text-base font-semibold text-slate-50 shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                    <span className="relative">{label}</span>
                </button>
            </Link>

        </>
    )
}
