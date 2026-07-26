import React, {useRef, useState} from 'react'

import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {BottomTabs} from "./components/bottomtabs/BottomTabs.jsx";
import { useEffect } from 'react';
import {Header} from "./components/Header/Header.jsx";
import {userApi} from "./api/user.js";
import {login , logout} from "./store/authSlice.js";
import {useDispatch} from "react-redux";
import {connectSocket} from "./connection.js";
import {toast} from "react-toastify";
import {Notification} from "./components/Notification.jsx";
import {BackgroundPattern} from "./components/BackgroundPattern.jsx";
import "react-toastify/dist/ReactToastify.css";


function App() {

     const location = useLocation()


    const [error, setError] = useState({
        error: false,
        message: ""
    })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [user, setUser] = useState(null)

    const socket = useRef(null);

    useEffect(() => {
        if(location.pathname.includes('/scan') || location.pathname.includes('/guest/chat')  ||   location.pathname.includes('/signup') ) {
            setLoading(false)

            return ;


        }

        setLoading(true)
        setError(()=> ({ error: false ,  message:""}))

        ;(async ()=> {
            try {

            const res = await userApi.getUser()
            if (!res || !res?.data || res?.data?.statusCode !== 200) {

                navigate('/signup' ,  {
                    state: {
                        from: location?.pathname
                    },
                    replace: true
                })
                dispatch(logout())
                setLoading(false)
                return
            }

            dispatch(login(res?.data?.data))
                setUser(res?.data?.data)

                setLoading(false)


        } catch (e) {

                try {

                    const refreshUser = await userApi.refreshUserToken()

                    if(refreshUser?.data?.statusCode !== 200) {

                        setLoading(false)

                        navigate("/signup" ,  {
                            state: {
                                from: location?.pathname
                            },
                            replace: true
                        })

                    }
                } catch (e){


                    setLoading(false)


                    navigate("/signup" ,  {
                        state: {
                            from: location?.pathname
                        },
                        replace: true
                    })


                }






                navigate('/signup' ,  {
                    state: {
                        from: location?.pathname
                    },
                    replace: true
                })
                dispatch(logout())
            setLoading(false)


            }


        })()

    }, []);








    useEffect(() => {
        if(location.pathname.includes('/scan') || location.pathname.includes('/guest/chat')  ||   location.pathname.includes('/signup')  )  {  setLoading(false)  ;   return}


        if(!user)  return;
        socket.current = connectSocket()


        socket.current.on("ALERT" , (data)=>{
            const {sessionId} = data

            if(sessionId){

                toast(


                    <Notification  message="you have a alert. click me"  />
                    , {

                        autoClose: false,
                        closeOnClick:true,
                        onClick: ()=> navigate(`/chat/${sessionId}`)
                    })


            }




        })

        return () => {
            if(socket.current){
                socket.current.disconnect();
            }
        }


    }, [user]);



    
    if(error.error) {
        return (
            <>

                <div className="min-h-dvh bg-slate-900 text-slate-100">
                    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                        <div
                            className="w-full rounded-3xl border border-slate-700/50 bg-slate-800/40 p-4 shadow-xl backdrop-blur-md sm:p-6"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base font-semibold tracking-tight text-slate-50">Something went wrong</h1>
                                    <p className="mt-1 text-sm leading-6 text-slate-300 break-words">{error.message}</p>
                                    <p className="mt-3 text-xs text-slate-400">
                                        If you’re not signed in, we’ll redirect you to the sign-in screen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }


  return !loading ? (



      <div className="relative min-h-dvh bg-slate-950 text-slate-100">
          <BackgroundPattern />
          <div className="relative z-10">
              <Header/>

              <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 sm:max-w-lg">
                  <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-3 shadow-md backdrop-blur-sm sm:p-4">
                      <Outlet/>
                  </div>
              </main>

              <BottomTabs/>
          </div>
      </div>


  ) : (


      <div className="min-h-dvh bg-slate-900 text-slate-100 relative overflow-hidden">
          
          <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg relative z-10">
              <div
                  className="relative w-full overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 shadow-xl backdrop-blur-md"
                  aria-busy="true"
                  aria-live="polite"
              >
                  <div className="relative flex flex-col items-center text-center gap-4">
                      <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                          <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400 border-l-indigo-400" />
                      </div>

                      <div className="min-w-0">
                          <h1 className="text-xl font-bold tracking-tight text-slate-100">Loading your account…</h1>
                          <p className="mt-2 text-sm leading-6 text-slate-400 max-w-[250px] mx-auto">
                              Securing your session and fetching your vehicles securely.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>


  )
}

export default App
