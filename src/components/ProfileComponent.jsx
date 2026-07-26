import React from "react";
import {useSelector} from "react-redux";

export const ProfileComponent = () => {

    const userInfo  = useSelector((state) => state.auth.userInfo);

    const avatarSrc = typeof userInfo?.avatar === "string" && userInfo.avatar.trim() ? userInfo.avatar.trim() : "";







    return (
        <>

        <div className="min-h-dvh bg-transparent text-slate-100">
            

            <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-5">
                <div className="rounded-3xl border border-slate-700/50 bg-slate-800/40 shadow-xl backdrop-blur-xl">
                    <div className="relative overflow-hidden rounded-3xl">

                        <div className="relative px-5 pb-5 pt-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">ACCOUNT</p>
                                    <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-100">
                                        Profile <span className="text-indigo-400">Details</span>
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                        Private by design. Visible by choice.
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <div className="relative">
                                        
                                        <div className="relative h-16 w-16 overflow-hidden rounded-[22px] border border-slate-700 bg-slate-900/40 shadow-sm">
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt="Avatar"
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <div className="relative">
                                                        <div className="h-3 w-3 rounded-full bg-slate-400" />
                                                        
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!userInfo ? (
                                <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-100">No user data</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Sign in again to load your profile details.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm">
                                            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">STATUS</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                                                <p className="text-sm font-semibold text-slate-100">Active</p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm">
                                            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">PRIVACY</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-100">Phone hidden</p>
                                            <p className="mt-1 text-xs text-slate-400">Contact via QR chat</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {userInfo?.fullName ? (
                                            <div className="group rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">FULL NAME</p>
                                                <p className="mt-1.5 text-base font-semibold text-slate-100">{userInfo.fullName}</p>
                                                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                                                <p className="mt-2 text-xs text-slate-500">Visible only in your account.</p>
                                            </div>
                                        ) : null}

                                        {userInfo?.username ? (
                                            <div className="group rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">USERNAME</p>
                                                <p className="mt-1.5 text-base font-semibold text-slate-100">{userInfo.username}</p>
                                            </div>
                                        ) : null}

                                        {userInfo?.email ? (
                                            <div className="group rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">EMAIL</p>
                                                <p className="mt-1.5 break-all text-base font-semibold text-slate-100">{userInfo.email}</p>
                                            </div>
                                        ) : null}

                                        {(userInfo?.createdAt || userInfo?.updatedAt) ? (
                                            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 shadow-sm">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">TIMELINE</p>
                                                <div className="mt-3 space-y-2">
                                                    {userInfo?.createdAt ? (
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-xs text-slate-400">Created</p>
                                                            <p className="text-xs font-semibold text-slate-200">{new Date(userInfo.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    ) : null}

                                                    {userInfo?.updatedAt ? (
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-xs text-slate-400">Updated</p>
                                                            <p className="text-xs font-semibold text-slate-200">{new Date(userInfo.updatedAt).toLocaleString()}</p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 px-1">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-200">Tip</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            Guests never see your email or phone. They only reach you through the QR chat.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        </>
    )
}
