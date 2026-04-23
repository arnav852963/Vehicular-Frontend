import React from "react";
import {useSelector} from "react-redux";

export const ProfileComponent = () => {

    const userInfo  = useSelector((state) => state.auth.userInfo);

    const avatarSrc = typeof userInfo?.avatar === "string" && userInfo.avatar.trim() ? userInfo.avatar.trim() : "";







    return (
        <>

        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_520px_at_15%_-10%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(820px_520px_at_90%_0%,rgba(244,63,94,0.14),transparent_58%),radial-gradient(900px_560px_at_50%_115%,rgba(16,185,129,0.12),transparent_55%)]" />
            <div className="pointer-events-none fixed inset-0 opacity-[0.07] mix-blend-overlay [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />

            <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-5">
                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/45 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                    <div className="relative overflow-hidden rounded-3xl">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -left-1/2 top-0 h-full w-[120%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-vehicular-shimmer" />
                            <div className="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
                            <div className="absolute -bottom-28 left-[-120px] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                        </div>

                        <div className="relative px-5 pb-5 pt-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400">ACCOUNT</p>
                                    <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">
                                        Profile <span className="text-sky-300">Details</span>
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                        Private by design. Visible by choice.
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <div className="relative">
                                        <div className="pointer-events-none absolute -inset-2 rounded-[22px] bg-[conic-gradient(from_var(--a),rgba(56,189,248,0.55),rgba(244,63,94,0.35),rgba(16,185,129,0.45),rgba(56,189,248,0.55))] opacity-80 blur-[6px] animate-vehicular-border-spin" />
                                        <div className="relative h-16 w-16 overflow-hidden rounded-[22px] border border-zinc-800 bg-zinc-950/40">
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
                                                        <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_0_7px_rgba(251,191,36,0.12)]" />
                                                        <div className="pointer-events-none absolute -inset-3 rounded-full border border-amber-400/20 animate-vehicular-soft-pulse" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!userInfo ? (
                                <div className="mt-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 p-5">
                                    <p className="text-sm font-semibold text-zinc-100">No user data</p>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        Sign in again to load your profile details.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4">
                                            <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">STATUS</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                                                <p className="text-sm font-semibold text-zinc-100">Active</p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4">
                                            <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">PRIVACY</p>
                                            <p className="mt-2 text-sm font-semibold text-zinc-100">Phone hidden</p>
                                            <p className="mt-1 text-xs text-zinc-400">Contact via QR chat</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {userInfo?.fullName ? (
                                            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4 transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">FULL NAME</p>
                                                <p className="mt-1.5 text-base font-semibold text-zinc-100">{userInfo.fullName}</p>
                                                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                                                <p className="mt-2 text-xs text-zinc-500">Visible only in your account.</p>
                                            </div>
                                        ) : null}

                                        {userInfo?.username ? (
                                            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4 transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">USERNAME</p>
                                                <p className="mt-1.5 text-base font-semibold text-zinc-100">{userInfo.username}</p>
                                            </div>
                                        ) : null}

                                        {userInfo?.email ? (
                                            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4 transition-transform duration-200 active:scale-[0.995]">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">EMAIL</p>
                                                <p className="mt-1.5 break-all text-base font-semibold text-zinc-100">{userInfo.email}</p>
                                            </div>
                                        ) : null}

                                        {(userInfo?.createdAt || userInfo?.updatedAt) ? (
                                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4">
                                                <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">TIMELINE</p>
                                                <div className="mt-3 space-y-2">
                                                    {userInfo?.createdAt ? (
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-xs text-zinc-400">Created</p>
                                                            <p className="text-xs font-semibold text-zinc-200">{new Date(userInfo.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    ) : null}

                                                    {userInfo?.updatedAt ? (
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-xs text-zinc-400">Updated</p>
                                                            <p className="text-xs font-semibold text-zinc-200">{new Date(userInfo.updatedAt).toLocaleString()}</p>
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
                    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/30 p-4">
                        <p className="text-xs font-semibold text-zinc-200">Tip</p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                            Guests never see your email or phone. They only reach you through the QR chat.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        </>
    )
}
