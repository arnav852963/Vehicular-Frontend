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
                    
                    <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-sm backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-rose-300">Error</p>
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
                
                <div className="mx-auto w-full max-w-md pb-24 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-slate-400">Inbox</p>
                            <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-100">
                                My <span className="text-indigo-400">Chats</span>
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                Past conversations from people who scanned your vehicle QR.
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
                            <p className="text-[11px] font-medium text-slate-400">Total</p>
                            <p className="text-lg font-semibold text-slate-100">{chats.length}</p>
                        </div>
                    </div>

                    {chats.length > 0 ? (
                        <div className="mt-5 space-y-3">
                            {chats.map((chat , index) =>(
                                <div key={index}>
                                    <div className="flex items-stretch gap-3">
                                        <Link
                                            to={`/chat/${chat?._id}`}
                                            className="group block flex-1 rounded-2xl border border-slate-700/40 bg-slate-800/40 p-4 shadow-sm backdrop-blur-sm transition hover:bg-slate-700/40 active:scale-[0.99]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vehicle</p>
                                                    <p className="mt-1 truncate text-base font-semibold text-slate-100">
                                                        {chat?.firstMessage}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Started {new Date(chat?.createdAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="mt-1 inline-flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_0_6px_rgba(99,102,241,0.12)]" />
                                                    <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100">
                                                        Open
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        <button
                                            type="button"

                                            onClick={()=> handleDelete(chat?._id)}
                                            className="inline-flex h-12 w-12 items-center justify-center self-center rounded-2xl border border-slate-700/50 bg-slate-800/40 text-slate-400 shadow-sm transition active:scale-[0.97] hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                            aria-label="Delete chat"
                                        >
                                            {deleteLoading ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500/40 border-t-slate-200" />
                                            ) : (
                                                <Delete className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )  : (
                        <div className="mt-5 w-full rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 text-sm text-slate-200 shadow-sm backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">No chats yet</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                        When someone scans your QR and messages you, it’ll appear here.
                                    </p>
                                </div>
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    ) : (
        <Container>
            <div className="relative">
                
                <div className="mx-auto w-full max-w-md pb-24 pt-5 relative">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-4 w-20 rounded-lg bg-slate-700 animate-pulse" />
                            <div className="h-7 w-40 rounded-lg bg-slate-700 animate-pulse" />
                            <div className="mt-4 space-y-3">
                                <div className="relative h-20 rounded-2xl bg-slate-700/30 ring-1 ring-slate-700/50 overflow-hidden flex items-center p-4">
                                     <div className="h-10 w-10 shrink-0 rounded-full bg-slate-600 mr-4 animate-pulse"></div>
                                     <div className="space-y-2 flex-1">
                                         <div className="h-3 w-1/2 rounded bg-slate-600 animate-pulse"></div>
                                         <div className="h-2 w-3/4 rounded bg-slate-600/60 animate-pulse"></div>
                                     </div>
                                </div>
                                <div className="relative h-20 rounded-2xl bg-slate-700/30 ring-1 ring-slate-700/50 overflow-hidden flex items-center p-4">
                                     <div className="h-10 w-10 shrink-0 rounded-full bg-slate-600 mr-4 animate-pulse"></div>
                                     <div className="space-y-2 flex-1">
                                         <div className="h-3 w-1/2 rounded bg-slate-600 animate-pulse"></div>
                                         <div className="h-2 w-3/4 rounded bg-slate-600/60 animate-pulse"></div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center justify-center motion-reduce:animate-none">
                        <span className="relative flex h-3 w-3 mb-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
                        </span>
                        <p className="text-sm font-medium tracking-widest text-indigo-400 uppercase">Loading Inbox</p>
                    </div>
                </div>
            </div>
        </Container>
    )
}
