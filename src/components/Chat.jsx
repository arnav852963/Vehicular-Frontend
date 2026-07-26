import React, {useEffect, useRef, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import {chatAPi} from "../api/chat...js";
import {connectSocket} from "../connection.js";
import {Input} from "./Input.jsx";
import {Filter} from "bad-words";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";
import {Message} from "./Message.jsx";
import {Send, Mic, Square, Trash2, Loader2} from "lucide-react";
import {vehicleApi} from "../api/vehicle.js";
import {useAudioRecorder} from "../hooks/audio.js";
import {uploadAudioToCloudinary} from "../hooks/cloudinary.js";
const filter = new Filter();

export const Chat = () => {

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [online , setOnline] = useState(true)
    const [isUploadingAudio, setIsUploadingAudio] = useState(false)
    const [recordingAudio, setRecordingAudio] = useState(false)

    const messageDictionary = useRef(new Map());
    const socket = useRef(null)
    const timeInterval = useRef(null)

    const [typing, setTyping] = useState(false)
    const scrollContainerRef = useRef(null)
    const bottomRef = useRef(null)
    const shouldStickToBottomRef = useRef(true)

    const [error, setError] = useState({
        error:false,
        message:""
    })

    const {sessionId}  = useParams()
    const [text, setText] = useState("")
    const [allowedToMessage, setAllowedToMessage] = useState(false)

    const location = useLocation()
    const isGuest = location?.pathname?.includes("/guest")
    const sendMailInfo = location?.state && location?.state?.mailInfo ? location?.state?.mailInfo : null

    const {
        startRecording,
        stopRecording,
        isRecording,
        audioBlob,
        transcript,
        interimTranscript,
        error: recordingError
    } = useAudioRecorder();

    useEffect(() => {
        if(recordingError) {
            toast(<Notification message={recordingError} />);
        }
    }, [recordingError]);

    useEffect(() => {
        if (isRecording) {
            socket.current?.emit("client_action", {
                type: "RECORDING_AUDIO",
            });
        } else {
            socket.current?.emit("client_action", {
                type: "STOP_RECORDING_AUDIO",
            });
        }
    }, [isRecording]);

    useEffect(() => {
        if(isGuest){
            socket.current = connectSocket({
                sessionId,
                senderType:"guest"
            })
        } else {
            socket.current = connectSocket({
                sessionId,
                senderType:"owner"
            })
        }

        socket.current.emit("client_action" , {
            type:"JOIN_ROOM",
            payload:{
                sessionId
            }
        } , (reciet)=>{
            if(reciet.success){
                toast(<Notification message="joined room successfully" />)
            } else {
                toast(<Notification message={"could not join room " + reciet.message} />)
            }
        } )

        socket.current.on("NEW_MESSAGE" , (message) =>{
            console.log("new message received " , message)
            message.timestamp = new Date().toLocaleString()

            setMessages((prev) => {
                if (prev.some(m => m.id === message.id)) {
                    return prev;
                }
                const next = [...prev , message]
                messageDictionary.current.set(message?.id , next.length-1)
                return next
            })

            setAllowedToMessage(true)
            socket.current.emit("client_action" , {
                type:"RECEIVED",
                payload: message?.id
            })
        })

        socket.current.on("NEW_AUDIO" , (audioMsg) => {
            console.log("new audio received " , audioMsg)
            audioMsg.timestamp = new Date().toLocaleString()

            setMessages((prev) => {
                if (prev.some(m => m.id === audioMsg.id)) {
                    return prev;
                }
                const next = [...prev , audioMsg]
                messageDictionary.current.set(audioMsg?.id , next.length-1)
                return next
            })

            setAllowedToMessage(true)
            socket.current.emit("client_action" , {
                type:"RECEIVED",
                payload: audioMsg?.id
            })
        })

        socket.current.on("TYPING" , ()=>{
            setTyping(true)
        })

        socket.current.on("STOP_TYPING" , ()=>{
            setTyping(false)
        })

        socket.current.on("RECORDING_AUDIO" , ()=>{
            setRecordingAudio(true)
        })

        socket.current.on("STOP_RECORDING_AUDIO" , ()=>{
            setRecordingAudio(false)
        })

        socket.current.on('DISCONNECTED' , ()=>{
            setOnline(false)
        })

        socket.current.on("MESSAGE_RECEIVED" , (messageId)=>{
            const indx = messageDictionary.current.get(messageId)
            if(indx === undefined) return

           setMessages((prev)=>{
               const next = prev.slice()
                if(next[indx]){
                    next[indx].received = true
                }
                return next
           })
        })

        return ()=>{
            if(socket.current){
                socket.current.disconnect()
            }
        }
    }, [isGuest , sessionId ]);

    useEffect(() => {
        setLoading(true)
        setError({error:false , message  : ""})
        ;(async ()=>{
            try {
                const res  = await chatAPi.getChats(sessionId)
                if (!res || !res?.data || !res?.data?.data ||res?.data?.statusCode !== 200) {
                    setError({error:true , message:"could not fetch chats"})
                    setLoading(false)
                    return
                }
                setMessages(res?.data?.data?.messages)
                res?.data?.data?.messages.forEach((message , index)=>{
                    messageDictionary.current.set(message?.id , index)
                })

                if(res?.data?.data?.messages[res?.data?.data?.messages?.length -1]?.senderType === "owner"){
                    setAllowedToMessage(true)
                }
                setLoading(false)
            } catch (e){
                setError({error:true , message:"could not fetch chats " + (e?.response?.data?.message  || "")})
                setLoading(false)
            }
        })()
    }, [sessionId]);

    useEffect(() => {
        if(!sendMailInfo) return
        (async ()=>{
            try {
                const res = await vehicleApi.sendMail(sendMailInfo)
                if (!res || !res?.data || res?.data?.statusCode !== 200) {
                    toast(<Notification message={"could not send mail info to the owner " + (res?.data?.message || "")} />)
                    return
                }
                toast(<Notification message={"mail info sent to the owner successfully"} />)
            } catch (e) {
                toast(<Notification message={"could not send mail info to the owner " + (e?.response?.data?.message || "")} />)
            }
        })()
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return

        const syncStickiness = () => {
            const threshold = 48
            const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
            shouldStickToBottomRef.current = distanceFromBottom <= threshold
        }

        syncStickiness()
        el.addEventListener("scroll", syncStickiness, { passive: true })
        return () => el.removeEventListener("scroll", syncStickiness)
    }, [])

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return
        if (!shouldStickToBottomRef.current) return

        requestAnimationFrame(() => {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
        })
    }, [messages.length, typing, recordingAudio])

    const handleMessageSubmit = ()=>{
        if(!text || text.trim() === ""){
            toast(<Notification message="please enter something" />)
            return
        }

        const cleanMessage = filter.clean(text)
        const messageId = crypto.randomUUID()

        socket.current?.emit("client_action" , {
            type:"SEND_NEW_MESSAGE",
            payload:{
                sessionId,
                text:cleanMessage,
                id:messageId
            }
        } , (reciet)=>{
            if(reciet.success){
                setText("")
                if(isGuest) setAllowedToMessage(false)
                setMessages((prev) => {
                   const next =  [...prev , {
                    senderType: !isGuest ? "owner" : "guest",
                    message: cleanMessage,
                    timestamp: new Date().toLocaleString(),
                    id: messageId
                }]
                    messageDictionary?.current.set(messageId , next.length-1)
                    return next
                })
            } else {
                toast(<Notification message={"could not send message " + reciet.message} />)
            }
        })
    }

    const handleSendAudio = async (blobToSend) => {
        const targetBlob = blobToSend || audioBlob;
        if(!targetBlob) return;

        try {
            setIsUploadingAudio(true);
            const cloudRes = await uploadAudioToCloudinary(targetBlob);
            const audioUrl = cloudRes?.secure_url || cloudRes?.url;

            if(!audioUrl) {
                toast(<Notification message="Could not process audio upload" />);
                setIsUploadingAudio(false);
                return;
            }

            const messageId = crypto.randomUUID();

            socket.current?.emit("client_action", {
                type: "SEND_AUDIO",
                payload: {
                    audioUrl,
                    id: messageId
                }
            }, (receipt) => {
                setIsUploadingAudio(false);
                if (receipt?.success) {
                    if (isGuest) setAllowedToMessage(false);
                    setMessages((prev) => {
                        const next = [...prev, {
                            senderType: !isGuest ? "owner" : "guest",
                            audio: audioUrl,
                            timestamp: new Date().toLocaleString(),
                            id: messageId
                        }];
                        messageDictionary.current.set(messageId, next.length - 1);
                        return next;
                    });
                } else {
                    toast(<Notification message={"Could not send audio: " + (receipt?.message || "")} />);
                }
            });
        } catch (err) {
            setIsUploadingAudio(false);
            toast(<Notification message={"Audio upload error: " + (err.message || "")} />);
        }
    };

    useEffect(() => {
        if (audioBlob) {
            handleSendAudio(audioBlob);
        }
    }, [audioBlob]);

    useEffect(() => {
        if(text) {
            socket.current?.emit("client_action", {
                type: "TYPING",
            })
            clearTimeout(timeInterval.current)
        }

        timeInterval.current = setTimeout(()=>{
            socket.current?.emit("client_action", {
                type: "STOP_TYPING",
            })
        } , 2000)
    }, [text]);

    if(error.error){
        return (
            <div className="min-h-[100svh] bg-transparent text-slate-100">
                <div className="mx-auto w-full max-w-md px-4 py-6">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-sm backdrop-blur">
                        <p className="text-xs font-semibold tracking-wide text-rose-300">ERROR</p>
                        <h1 className="mt-1 text-pretty text-sm font-medium text-slate-200/95">{error.message}</h1>
                    </div>
                </div>
            </div>
        )
    }

    return !loading ? (
        <div className="min-h-[100svh] bg-transparent text-slate-100">
            <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col">
                <div className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/85 px-4 py-3 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold tracking-wide text-slate-400">
                                {!isGuest ? "OWNER CHAT" : "GUEST CHAT"}
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-100">
                                {!isGuest ? `Guest ${sessionId}` : `Owner ${sessionId}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={"inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium " + (recordingAudio ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : typing ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-200" : "border-slate-700/50 bg-slate-800/50 text-slate-300/80")}>
                                <span className={"h-1.5 w-1.5 rounded-full " + (recordingAudio ? "bg-rose-400 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]" : typing ? "bg-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" : "bg-slate-400/60")} aria-hidden="true" />
                                {recordingAudio ? "Recording audio…" : typing ? "Typing" : (online ? "Online" : "Offline") }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 px-4 py-4">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 shadow-sm backdrop-blur-sm h-full">
                        <div ref={scrollContainerRef} className="h-full overflow-y-auto px-3 py-4">
                            {messages.length === 0 ? (
                                <div className="mx-auto flex max-w-[22rem] flex-col items-center gap-3 py-10 text-center">
                                    <div className="h-12 w-12 rounded-2xl border border-slate-700/50 bg-slate-800/50" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">No messages yet</p>
                                        <p className="mt-1 text-xs text-slate-400">Send a quick message or audio note to start.</p>
                                    </div>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {messages.map((message) =>{
                                        const hasValidImage = message.vehicleImage && message.vehicleImage !== "null" && message.vehicleImage !== "undefined";

                                        return (
                                            <li key={message?.id}>
                                                <Message
                                                    payload={message?.message}
                                                    me={!isGuest === (message?.senderType === "owner")}
                                                    time={message?.timestamp}
                                                    vehicleImage={hasValidImage ? message?.vehicleImage : ""}
                                                    audio={message?.audio || ""}
                                                    received={message?.received || false}
                                                />
                                            </li>
                                        )
                                    })}

                                    {recordingAudio ? (
                                        <li>
                                            <div className="flex w-full justify-start py-1.5">
                                                <div className="max-w-[86%] sm:max-w-[75%]">
                                                    <div className="relative overflow-hidden rounded-2xl rounded-bl-md bg-rose-950/40 px-3.5 py-2.5 text-rose-200 shadow-sm border border-rose-500/30">
                                                        <div className="relative flex items-center gap-2">
                                                            <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                                                            <Mic className="h-3.5 w-3.5 text-rose-400" />
                                                            <span className="text-xs font-medium text-rose-300">Recording audio…</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ) : null}

                                    {typing ? (
                                        <li>
                                            <div className="flex w-full justify-start py-1.5">
                                                <div className="max-w-[86%] sm:max-w-[75%]">
                                                    <div className="relative overflow-hidden rounded-2xl rounded-bl-md bg-slate-800/70 px-3.5 py-2.5 text-slate-100 shadow-sm border border-slate-700/50">
                                                        <div className="relative flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1">
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.2s]" />
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.1s]" />
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                                                            </span>
                                                            <span className="text-xs font-medium text-slate-400">Typing…</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ) : null}

                                    <li ref={bottomRef} />
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 z-20 border-t border-slate-700/50 bg-slate-900/90 px-4 py-3 backdrop-blur">
                    {!isGuest || allowedToMessage ? (
                        <>
                            {isRecording ? (
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="h-3 w-3 animate-ping rounded-full bg-rose-500" />
                                        <span className="truncate text-xs font-medium text-rose-200">
                                            {interimTranscript || transcript || "Recording audio..."}
                                        </span>
                                    </div>
                                    <button
                                        onClick={stopRecording}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-slate-950 shadow-sm transition active:scale-[0.98] hover:bg-rose-400"
                                        aria-label="Stop and Send audio"
                                        title="Stop & Send"
                                    >
                                        <Square className="h-4 w-4 fill-current" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Enter your message"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            type="text"
                                        />
                                    </div>

                                    {isUploadingAudio ? (
                                        <button
                                            disabled
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/50 text-slate-50 opacity-70 cursor-not-allowed"
                                        >
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </button>
                                    ) : (text && text.trim() !== "") ? (
                                        <button
                                            onClick={handleMessageSubmit}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-slate-50 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-400"
                                            aria-label="Send message"
                                            title="Send"
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={startRecording}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-indigo-400 border border-slate-700/60 shadow-sm transition active:scale-[0.98] hover:bg-slate-700/80 hover:text-indigo-300"
                                            aria-label="Record voice note"
                                            title="Record Audio"
                                        >
                                            <Mic className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                                Keep it short and clear. You’re chatting anonymously.
                            </p>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3.5 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-semibold text-slate-100">Waiting for owner reply</p>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                To prevent spam, guests can send a message only after the owner replies.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[100svh] bg-transparent text-slate-100">
            <div className="mx-auto w-full max-w-md px-4 py-6">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold tracking-wide text-slate-400">LOADING</p>
                    <h1 className="mt-1 text-sm font-medium text-slate-200/95">Fetching chat…</h1>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
                        <div className="h-full w-1/3 animate-pulse rounded-full bg-indigo-400/70" />
                    </div>
                </div>
            </div>
        </div>
    )
}
