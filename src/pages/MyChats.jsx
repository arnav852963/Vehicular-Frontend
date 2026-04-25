import {Container} from "../components/Container.jsx";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {userApi} from "../api/user.js";
import {Link} from "react-router-dom";
import {Delete} from "lucide-react";
import {chatAPi} from "../api/chat...js";
import {toast} from "react-toastify";
import {Notification} from "../components/Notification.jsx";

export const MyChatsPage = () => {



    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({
        error: false,
        message: ""
    })
    const [deleteLoading, setDeleteLoading] = useState(false)
    useEffect(() => {
        ;(async ()=>{

            try {


                const chats = await userApi.getUserChats()


                if (!chats || !chats?.data || !chats?.data?.data || chats?.data?.statusCode !== 200) {


                    setError({
                        error: true,
                        message: "could not fetch chats"
                    })

                    setLoading(false)

                    return
                }

                setChats(chats?.data?.data)


                setLoading(false)

            } catch (e) {
                setError({
                    error: true,
                    message: e?.response?.data?.message || "An error occurred while fetching chats"
                })

                setLoading(false)
            }

        })()

    }, []);



    const handleDelete = async (chatId)=>{

setDeleteLoading(true)


        try {

                const chatDelete = await chatAPi.deleteChat(chatId)

                if(!chatDelete || !chatDelete?.data || !chatDelete?.data?.data || chatDelete?.data?.statusCode !== 200){
                    toast(<Notification message="An error occurred while deleting the chat"/>)
                    setDeleteLoading(false)
                    return
                }

                setChats((prev) =>{
                    const newChat = prev.filter((chat)=>{
                        return chat?._id !== chatId
                    })


                    return newChat
                })
            setDeleteLoading(false)

        } catch (e) {
                toast(<Notification message={e?.response?.data?.message || "An error occurred while deleting the chat"}/>)
            setDeleteLoading(false)

        }

    }

    if(error && error?.error){
        return (
            <Container>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(700px_450px_at_85%_0%,rgba(244,63,94,0.10),transparent_55%)]" />
                    <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-[0_14px_40px_-28px_rgba(244,63,94,0.45)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-rose-200/80">Error</p>
                                <p className="mt-1 font-semibold text-rose-100">{error?.message || "An error occurred while fetching chats"}</p>
                            </div>
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.14)]" />
                        </div>
                    </div>
                </div>
            </Container>
        )
    }



    return !loading ? (
        <Container>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(700px_450px_at_80%_0%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(800px_500px_at_50%_120%,rgba(16,185,129,0.08),transparent_55%)]" />

                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-zinc-400">Inbox</p>
                            <h1 className="mt-1 text-2xl font-semibold leading-tight text-zinc-100">
                                My <span className="text-sky-300">Chats</span>
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                Past conversations from people who scanned your vehicle QR.
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-zinc-800/70 bg-zinc-900/60 px-3 py-2 text-right">
                            <p className="text-[11px] font-medium text-zinc-400">Total</p>
                            <p className="text-lg font-semibold text-zinc-100">{chats.length}</p>
                        </div>
                    </div>

                    {chats.length > 0 ? (
                        <div className="mt-5 space-y-3">
                            {chats.map((chat , index) =>(
                                <div key={index}>
                                    <div className="flex items-stretch gap-3">
                                        <Link
                                            to={`/chat/${chat?._id}`}
                                            className="group block flex-1 rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4 shadow-[0_18px_60px_-44px_rgba(0,0,0,0.95)] transition active:scale-[0.99]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Vehicle</p>
                                                    <p className="mt-1 truncate text-base font-semibold text-zinc-100">
                                                        {chat?.firstMessage}
                                                    </p>
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        Started {new Date(chat?.createdAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="mt-1 inline-flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                                                    <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">
                                                        Open
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        <button
                                            type="button"

                                            onClick={()=> handleDelete(chat?._id)}
                                            className="inline-flex h-12 w-12 items-center justify-center self-center rounded-2xl border border-zinc-800/70 bg-zinc-950/50 text-zinc-300 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.95)] transition active:scale-[0.97] hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                            aria-label="Delete chat"
                                        >
                                            {deleteLoading ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500/40 border-t-zinc-200" />
                                            ) : (
                                                <Delete className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )  : (
                        <div className="mt-5 w-full rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-200">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">No chats yet</p>
                                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                                        When someone scans your QR and messages you, it’ll appear here.
                                    </p>
                                </div>
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.12)]" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    ) : (
        <Container>
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_-10%,rgba(56,189,248,0.10),transparent_60%)]" />
                <div className="mx-auto w-full max-w-md pb-24 pt-5 relative">
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-[0_0_20px_rgba(56,189,248,0.05)] backdrop-blur">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -left-1/2 top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-vehicular-shimmer" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-4 w-20 rounded-lg bg-zinc-800/80 relative overflow-hidden" >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-vehicular-shimmer" />
                            </div>
                            <div className="h-7 w-40 rounded-lg bg-zinc-800/80 relative overflow-hidden" >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-vehicular-shimmer" />
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="relative h-20 rounded-2xl bg-zinc-800/50 ring-1 ring-zinc-700/50 overflow-hidden flex items-center p-4">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-vehicular-shimmer" />
                                     <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-700/80 mr-4"></div>
                                     <div className="space-y-2 flex-1">
                                         <div className="h-3 w-1/2 rounded bg-zinc-700/80"></div>
                                         <div className="h-2 w-3/4 rounded bg-zinc-700/60"></div>
                                     </div>
                                </div>
                                <div className="relative h-20 rounded-2xl bg-zinc-800/50 ring-1 ring-zinc-700/50 overflow-hidden flex items-center p-4">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-vehicular-shimmer" />
                                     <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-700/80 mr-4"></div>
                                     <div className="space-y-2 flex-1">
                                         <div className="h-3 w-1/2 rounded bg-zinc-700/80"></div>
                                         <div className="h-2 w-3/4 rounded bg-zinc-700/60"></div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center justify-center animate-vehicular-float motion-reduce:animate-none">
                        <span className="relative flex h-3 w-3 mb-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
                        </span>
                        <p className="text-sm font-medium tracking-widest text-cyan-500/80 uppercase">Loading Inbox</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
