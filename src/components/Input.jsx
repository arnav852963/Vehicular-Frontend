import React, {useId} from "react";


export const Input = React.forwardRef( ({
    label="",
    type,
    className="",
    ...props
                      } , ref) => {


    const id  = useId()
    return (
        <>
            <div className="space-y-1">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-zinc-200">
                        {label}
                    </label>
                )}

                <input
                    ref={ref}
                    id={id}
                    type={type}
                    className={
                        "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 " +
                        "placeholder:text-zinc-500 shadow-sm shadow-black/10 " +
                        "focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 " +
                        "disabled:opacity-60 disabled:cursor-not-allowed " +
                        "aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/40 " +
                        className
                    }
                    {...props}
                />
            </div>





        </>
    )
}
)
