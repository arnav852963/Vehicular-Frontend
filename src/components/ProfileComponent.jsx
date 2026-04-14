import React from "react";
import {useSelector} from "react-redux";

export const ProfileComponent = () => {

    const userInfo  = useSelector((state) => state.auth.userInfo);

    const avatarSrc = typeof userInfo?.avatar === "string" && userInfo.avatar.trim() ? userInfo.avatar.trim() : "";







    return (
        <>

        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(800px_500px_at_50%_120%,rgba(16,185,129,0.08),transparent_55%)]" />

            <div className="relative mx-auto w-full max-w-md px-4 pb-24 pt-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-zinc-400">Account</p>
                        <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">
                            Profile <span className="text-sky-300">Details</span>
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                            Your identity stays private—only the info needed for your account lives here.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
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
                                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!userInfo ? (
                    <div className="mt-6 rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-5">
                        <p className="text-sm font-semibold text-zinc-100">No user data</p>
                        <p className="mt-1 text-sm text-zinc-400">
                            Sign in again to load your profile details.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {userInfo?.fullName ? (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Full name</p>
                                <p className="mt-1 text-base font-semibold text-zinc-100">{userInfo.fullName}</p>
                            </div>
                        ) : null}

                        {userInfo?.username ? (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Username</p>
                                <p className="mt-1 text-base font-semibold text-zinc-100">{userInfo.username}</p>
                            </div>
                        ) : null}

                        {userInfo?.email ? (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</p>
                                <p className="mt-1 break-all text-base font-semibold text-zinc-100">{userInfo.email}</p>
                            </div>
                        ) : null}

                        {userInfo?.createdAt ? (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Created</p>
                                <p className="mt-1 text-sm font-medium text-zinc-200">{new Date(userInfo.createdAt).toLocaleString()}</p>
                            </div>
                        ) : null}

                        {userInfo?.updatedAt ? (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Updated</p>
                                <p className="mt-1 text-sm font-medium text-zinc-200">{new Date(userInfo.updatedAt).toLocaleString()}</p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>

        </>
    )
}
