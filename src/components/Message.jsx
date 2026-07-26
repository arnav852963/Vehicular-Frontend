import React, { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

const WAVEFORM_BARS = [35, 65, 40, 85, 60, 95, 45, 75, 100, 50, 80, 65, 40, 90, 55, 35, 70, 85, 45, 60, 90, 50, 30, 65];

const VoiceNotePlayer = ({ src, me }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleWaveformClick = (e) => {
        if (!duration || !audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        audioRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="relative my-1 flex min-w-[220px] max-w-[270px] items-center gap-3 rounded-2xl bg-slate-900/80 p-2.5 border border-slate-700/50 backdrop-blur-md shadow-lg">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
                className="hidden"
            />

            <button
                onClick={togglePlay}
                type="button"
                className={
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-950 shadow-md transition active:scale-95 " +
                    (me ? "bg-indigo-400 hover:bg-indigo-300 shadow-indigo-500/20" : "bg-indigo-500 hover:bg-indigo-400 text-slate-50 shadow-indigo-500/30")
                }
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div
                    onClick={handleWaveformClick}
                    className="relative flex items-center justify-between gap-[2px] h-6 w-full cursor-pointer py-1 select-none group"
                >
                    {WAVEFORM_BARS.map((height, idx) => {
                        const barPercent = (idx / WAVEFORM_BARS.length) * 100;
                        const isActive = progressPercent >= barPercent;
                        return (
                            <span
                                key={idx}
                                className={
                                    "w-1 rounded-full transition-all duration-150 " +
                                    (isActive
                                        ? "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.7)] " + (isPlaying ? "animate-pulse" : "")
                                        : "bg-slate-700/60 group-hover:bg-slate-600/80")
                                }
                                style={{ height: `${height}%` }}
                            />
                        );
                    })}
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 tracking-wider">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export const Message = ({ payload, me, time, vehicleImage = "", audio = "", received }) => {
    return (
        <>
            <div className={`flex w-full ${me ? "justify-end" : "justify-start"} py-1.5`}>
                <div className={`max-w-[86%] sm:max-w-[75%] ${me ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                        className={
                            "relative overflow-hidden px-3.5 py-2.5 shadow-sm border " +
                            (me
                                ? "rounded-2xl rounded-br-md bg-slate-800 text-slate-50 border-indigo-500/30"
                                : "rounded-2xl rounded-bl-md bg-slate-800/70 text-slate-100 border-slate-700/50")
                        }
                    >

                        <div
                            className={
                                "pointer-events-none absolute bottom-0 h-3 w-3 rotate-45 ring-1 " +
                                (me
                                    ? "-right-1 bg-slate-950 ring-cyan-400/20"
                                    : "-left-1 bg-zinc-950/70 ring-white/10")
                            }
                        />

                        {vehicleImage && vehicleImage !== "null" && vehicleImage !== "undefined" && (
                            <div className="relative mb-2 overflow-hidden rounded-xl ring-1 ring-white/10">
                                <img
                                    src={vehicleImage}
                                    alt={payload || "Attachment"}
                                    loading="lazy"
                                    className="h-auto w-full max-h-64 object-cover"
                                    onError={(e) => {
                                        e.target.parentElement.style.display = 'none';
                                    }}
                                />
                                <div
                                    className={
                                        "pointer-events-none absolute inset-0 " +
                                        (me
                                            ? "bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"
                                            : "bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent")
                                    }
                                />
                            </div>
                        )}

                        {audio && <VoiceNotePlayer src={audio} me={me} />}

                        <div className="relative">
                            {!!payload && (
                                <p className="whitespace-pre-wrap break-words text-[15px] leading-5 text-inherit">
                                    {payload}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 ${me ? "justify-end" : "justify-start"}`}>
                        {!!time && (
                            <p className={`text-[11px] font-medium ${me ? "text-slate-300/70" : "text-slate-400/90"}`}>
                                {time}
                            </p>
                        )}

                        {me && (
                            <span
                                className={
                                    "select-none text-[12px] font-semibold tracking-tight " +
                                    (received ? "text-cyan-300/90" : "text-slate-300/60")
                                }
                                aria-label={received ? "Delivered" : "Sent"}
                                title={received ? "Delivered" : "Sent"}
                            >
                                {received ? "✓✓" : "✓"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
