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
        if(location.pathname.includes('/scan') || location.pathname.includes('/guest/chat')  ) {
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

    }, [dispatch , navigate , location.pathname]);




    useEffect(() => {


        if(location.pathname.includes('/scan') || location.pathname.includes('/guest/chat')  ) {  setLoading(false)  ;   return}
        ;(async ()=>{

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


        })()


    }, [location.pathname])



    useEffect(() => {
        if(location.pathname.includes('/scan') || location.pathname.includes('/guest/chat')  )  {  setLoading(false)  ;   return}


        if(!user)  return;
        socket.current = connectSocket({
            ownerToken: user._id
        })


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


    }, [user , location.pathname ]);



// race condition of get user and refreshtoken
    
    if(error.error) {
        return (
            <>

                <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
                        <div
                            className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base font-semibold tracking-tight text-zinc-50">Something went wrong</h1>
                                    <p className="mt-1 text-sm leading-6 text-zinc-300/90 break-words">{error.message}</p>
                                    <p className="mt-3 text-xs text-zinc-400/90">
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


      
      <div className="min-h-dvh bg-zinc-950 text-zinc-100">

          <Header/>


          <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 sm:max-w-lg">

              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-4">
                  <Outlet/>
              </div>
          </main>

          <BottomTabs/>
      </div>


  ) : (


      <div className="min-h-dvh bg-zinc-950 text-zinc-100">
          <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10 sm:max-w-lg">
              <div
                  className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur sm:p-6"
                  aria-busy="true"
                  aria-live="polite"
              >
                  <div className="flex items-center gap-3">
                      <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                      </div>

                      <div className="min-w-0">
                          <h1 className="text-base font-semibold tracking-tight text-zinc-50">Loading your account…</h1>
                          <p className="mt-1 text-sm leading-6 text-zinc-300/90">
                              Securing your session and fetching your vehicles.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>


  )
}

export default App
