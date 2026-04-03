import { useState} from 'react'

import {Outlet, useNavigate} from "react-router-dom";
import {BottomTabs} from "./components/bottomtabs/BottomTabs.jsx";
import { useEffect } from 'react';
import {Header} from "./components/Header/Header.jsx";
import {userApi} from "./api/user.js";
import {login , logout} from "./store/authSlice.js";
import {useDispatch} from "react-redux";

function App() {

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {

        setLoading(true)
        setError(()=> ({ error: false ,  message:""}))

        ;(async ()=> {
            try {

            const res = await userApi.getUser()
            if (!res || !res?.data || res?.data?.statusCode !== 200) {
                setError({error: true, message: "Failed to fetch user data"})
                navigate('/signin')
                dispatch(logout())
                setLoading(false)
                return
            }

            dispatch(login(res?.data?.data))

                navigate('/')
        } catch (e) {
            setError({error: true, message: "An error occurred while fetching user data"})

                navigate('/signin')
                dispatch(logout())
            setLoading(false)


            }


        })()

    }, []);


  return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100">

          <Header/>


          <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 sm:max-w-lg">

              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-4">
                  <Outlet/>
              </div>
          </main>

          <BottomTabs/>
      </div>
  )
}

export default App
