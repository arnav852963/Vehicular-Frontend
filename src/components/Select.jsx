import React, {useId} from "react";

export const Select = React.forwardRef (({label , options , ...props } , ref) => {


    const id = useId()


    return (
        <>

            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-2 block text-xs font-semibold tracking-wide text-zinc-200/90"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    <select
                        ref={ref}
                        id={id}
                        {...props}
                        className={
                            "peer w-full appearance-none rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-4 py-3 pr-11 text-sm text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition " +
                            "placeholder:text-zinc-500/90 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                        }
                    >
                        {options?.map((o) => (
                            <option key={String(o)} value={o} className="bg-zinc-950 text-zinc-100">
                                {o}
                            </option>
                        ))}
                    </select>


                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-zinc-400 peer-focus:text-cyan-300"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>


                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5 peer-focus:ring-cyan-500/15" />
                </div>
            </div>

        </>
    )





})









