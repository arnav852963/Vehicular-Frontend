import React, {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {chatAPi} from "../api/chat...js";
import {connectSocket} from "../connection.js";
import {Input} from "./Input.jsx";
import {Filter} from "bad-words";
import {toast} from "react-toastify";
import {Notification} from "./Notification.jsx";
import {Message} from "./Message.jsx";
import {Send} from "lucide-react"
const filter = new Filter();

export const Chat = () => {

    const [messages, setMessages] = useState([])

    const [loading, setLoading] = useState(true)

    const [online , setOnline] = useState(true)

    const messageDictionary = useRef(new Map());


    const  socket = useRef(null)

    const timeInterval = useRef(null)



    const [typing, setTyping] = useState(false)

    const scrollContainerRef = useRef(null)
    const bottomRef = useRef(null)





    const [error, setError] = useState({
        error:false,
        message:""
    })


    const {sessionId}  = useParams()
    const [text, setText] = useState("")

    const [allowedToMessage, setAllowedToMessage] = useState(false)


    const isOwner = useSelector((state)=> state?.auth?.isAuthenticated)

    if(isOwner) setAllowedToMessage(true)


    useEffect(() => {

        if(!isOwner){

            socket.current = connectSocket({
                sessionId
            })





        }



        else {

            socket.current = connectSocket({
                sessionId
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
                }
                    else {
                    toast(<Notification message={"could not join room " + reciet.message} />)
                }
            } )





        socket.current.on("NEW_MESSAGE" , (message) =>{

            console.log("new message received " , message)


            message.timestamp = new Date().toLocaleString()


            setMessages((prev) => {



                const next = [...prev , message]
                messageDictionary.current.set(message?.id , next.length-1)
                return  next



            })





            setAllowedToMessage(true)


            socket.current.emit("client_action" , {
                type:"RECEIVED",
                payload: message?.id
            })



        })

        socket.current.on("TYPING" , ()=>{
            setTyping(true)
        })

        socket.current.on("STOP_TYPING" , ()=>{
            setTyping(false)
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




    }, [isOwner , sessionId ]);




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
                setLoading(false)

            }  catch (e){
                setError({error:true , message:"could not fetch chats " + (e?.response?.data?.message  || "")})
                setLoading(false)




            }


        })()




    }, [sessionId]);


    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return

        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({behavior: "smooth", block: "end"})
        })
    }, [messages.length, typing])



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
                if(!isOwner) setAllowedToMessage(false)
                setMessages((prev) => {

                   const next =  [...prev , {
                    senderType: isOwner ? "owner" : "guest",
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

    useEffect(() => {

        if(text)
        {

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
        <div className="min-h-[100svh] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-md px-4 py-6">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <p className="text-xs font-semibold tracking-wide text-rose-300">ERROR</p>
                    <h1 className="mt-1 text-pretty text-sm font-medium text-slate-200/95">{error.message}</h1>
                </div>
            </div>
        </div>
    )
}




    return !loading ? (
        <div className="min-h-[100svh] bg-slate-950 text-slate-100">
            <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col">
                <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold tracking-wide text-slate-300/70">
                                {isOwner ? "OWNER CHAT" : "GUEST CHAT"}
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-100">
                                {isOwner ? `Guest ${sessionId}` : `Owner ${sessionId}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={"inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium " + (typing ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-white/10 bg-white/5 text-slate-300/80")}>
                                <span className={"h-1.5 w-1.5 rounded-full " + (typing ? "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]" : "bg-slate-400/60")} aria-hidden="true" />
                                {typing ? "Typing" : (online ? "Online" : "Offline") }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-4 py-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                        <div ref={scrollContainerRef} className="max-h-[calc(100svh-168px)] overflow-y-auto px-3 py-4">
                            {messages.length === 0 ? (
                                <div className="mx-auto flex max-w-[22rem] flex-col items-center gap-3 py-10 text-center">
                                    <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">No messages yet</p>
                                        <p className="mt-1 text-xs text-slate-300/70">Send a quick message to start the conversation.</p>
                                    </div>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {messages.map((message , index) =>{

                                        return message.vehicleImage ?  (<li key={message?.id}>

                                            <Message
                                                payload={message?.message}
                                                me={isOwner === (message?.senderType === "owner")}
                                                time={message?.timestamp}
                                                vehicleImage={message?.vehicleImage}
                                                received={message?.received || false}


                                            />
                                        </li> ):  (<li key={message?.id}>

                                            <Message
                                                payload={message?.message}
                                                me={isOwner === (message?.senderType === "owner")}
                                                time={message?.timestamp}
                                                received={message?.received || false}

                                            />
                                        </li>)

                                        }


                                    )}

                                    {typing ? (
                                        <li>
                                            <div className="flex w-full justify-start py-1.5">
                                                <div className="max-w-[86%] sm:max-w-[75%]">
                                                    <div className="relative overflow-hidden rounded-2xl rounded-bl-md bg-zinc-950/70 px-3.5 py-2.5 text-zinc-100 shadow-lg shadow-black/20 ring-1 ring-white/10">
                                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(148,163,184,0.10),transparent_60%)]" />
                                                        <div className="relative flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1">
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.2s]" />
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.1s]" />
                                                                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
                                                            </span>
                                                            <span className="text-xs font-medium text-slate-300/70">Typing…</span>
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

                <div className="sticky bottom-0 z-20 border-t border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
                    {isOwner || allowedToMessage ? (
                        <>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter your message"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        type="text"
                                    />
                                </div>

                                <button
                                    onClick={handleMessageSubmit}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 shadow-[0_10px_25px_rgba(34,211,238,0.22)] ring-1 ring-cyan-400/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Send message"
                                    title="Send"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="mt-2 text-[11px] font-medium text-slate-300/60">
                                Keep it short and clear. You’re chatting anonymously.
                            </p>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-3.5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                            <p className="text-xs font-semibold text-slate-100">Waiting for owner reply</p>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-300/70">
                                To prevent spam, guests can send a message only after the owner replies.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[100svh] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-md px-4 py-6">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <p className="text-xs font-semibold tracking-wide text-slate-300/70">LOADING</p>
                    <h1 className="mt-1 text-sm font-medium text-slate-200/95">Fetching chat…</h1>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-400/70" />
                    </div>
                </div>
            </div>
        </div>
    )
}
