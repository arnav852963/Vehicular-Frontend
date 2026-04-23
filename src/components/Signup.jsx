import React, {useEffect, useState} from "react";
import {auth , googleProvider} from "../firebaseConfig/firebase.js";
import { Input } from "./Input";
import {useForm} from "react-hook-form";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {authApi} from "../api/auth.js";
import {useDispatch, useSelector} from "react-redux";
import {login as authLogin , logout as authLogout} from "../store/authSlice.js";
 import {useLocation, useNavigate} from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Logo } from "./Logo";
import {userApi} from "../api/user.js";




export const Signup = () => {

    const [error, setError] = useState({})
    const [loading, setLoading] = useState(false)
    const {register, handleSubmit} = useForm()
    const dispatch = useDispatch()

    const navigate  = useNavigate()
    const googleProvider = new GoogleAuthProvider();

    const location = useLocation()


    const isAuth = useSelector((state)=>state?.auth?.isAuthenticated)

    let pathAfterSubmit = location?.state?.from ? location?.state?.from : '/'


    pathAfterSubmit  = String(pathAfterSubmit)


    useEffect(() => {
        if(!isAuth) return

        ;(async ()=>{

            try {

                const res = await userApi.getUser()
                if (!res || !res?.data || res?.data?.statusCode !== 200) {
                    setLoading(false)
                    return
                }

                dispatch(authLogin(res?.data?.data))
                navigate(pathAfterSubmit)
                setLoading(false)

            } catch (e) {

                    setLoading(false)

            }

        } )()

    }, []);


    const handleGoogleLogin = async () => {
        try {

            const userCredential = await signInWithPopup(auth, googleProvider);
            if (!userCredential) {
                setError({error: true , message:"google login error "})
                setLoading(false)
                return
            }
            const user = userCredential.user;

            if(!user){
                setError({error: true , message:"google login error "})
                setLoading(false)
                return
            }


            const idToken = await user.getIdToken();

            if(!idToken){
                setError({error: true , message:"google login error "})
                setLoading(false)
                return
            }

            const res = await authApi.googleAuth(idToken)

            if (!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 201) {
                setError({error: true , message:"google login error " + (res?.data?.message || "unknown error")})
                setLoading(false)
                return
            }

            dispatch(authLogin(res?.data?.data))
            navigate(pathAfterSubmit)
            setLoading(false)




        } catch (error) {
            setError({error: true , message:"google login error " + error.message})
            setLoading(false)
        }
    };

    const handleFirebase = async (email , password) => {
        setLoading(true)
        setError({error: false , message:""})

        if(!email || !password){
            setError({error: true , message:"email and password are required"})
            setLoading(false)
            return
        }
        try {

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if(!userCredential){
                setError({error: true , message:"invalid email or password"})
                setLoading(false)
                return
            }

            const user = userCredential.user
            if(!user){
                setError({error: true , message:"invalid email or password"})
                setLoading(false)
                return
            }


            const idToken = await user.getIdToken();

            if(!idToken){
                setError({error: true , message:"firebase error "})
                setLoading(false)
                return
            }

            return idToken




        } catch (error) {
            setError({error: true , message:"firebase error " + error.message})
            setLoading(false)

        }
    }

    const handleFirebaseCreateUser = async (email , password) => {
        setLoading(true)
        setError({error: false , message:""})

        if(!email || !password){
            setError({error: true , message:"email and password are required"})
            setLoading(false)
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if(!userCredential){
                setError({error: true , message:"signup error"})
                setLoading(false)
                return
            }

            const user = userCredential.user
            if(!user){
                setError({error: true , message:"signup error"})
                setLoading(false)
                return
            }

            const idToken = await user.getIdToken();
            if(!idToken){
                setError({error: true , message:"firebase error "})
                setLoading(false)
                return
            }

            return idToken
        } catch (error) {
            // If the account already exists, we'll fall back to sign-in in handleSignup.
            throw error
        }
    }


    const handleSignup = async ({email , password})=>{
        console.log("email " , email , "password " , password)

        if(!email || !password) {
            setError({error: true, message: "email and password are required"})
            setLoading(false)
            return
        }
        
        let idToken


        try {
            idToken = await handleFirebaseCreateUser(email , password)
        } catch (error) {
            if (error?.code === "auth/email-already-in-use") {
                idToken = await handleFirebase(email , password)
            } else {
                setError({error: true , message:"firebase error " + (error?.message || "")})
                setLoading(false)
                return
            }
        }


        if(!idToken){
            setError({error: true , message:"firebase error "})
            setLoading(false)
            return
        }

        try{
            const res = await authApi.firebaseAuth(idToken)
            if(!res || !res?.data || !res?.data?.data || res?.data?.statusCode !== 201){

                setError({error: true , message:"signup error " + (res?.data?.message || "unknown error")})
                setLoading(false)
                return

            }

            dispatch(authLogin(res?.data?.data))
            navigate(pathAfterSubmit)
            setLoading(false)





        } catch (error) {
            setError({error: true , message:"signup error " + error.message})
            setLoading(false)
        }



    }



if(error.error){
    return (
        <div className="relative min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:px-6 flex items-start justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)", backgroundSize: "26px 26px" }} />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-black" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(closest-side at 50% 10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(closest-side at 20% 80%, rgba(16,185,129,0.08), transparent 60%)" }} />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 85%)" }} />
            </div>
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-zinc-900/60 p-6 shadow-xl shadow-black/40">
                    <style>{`@keyframes vehicular-sweep{0%{transform:translateX(-160%) skewX(-18deg)}100%{transform:translateX(160%) skewX(-18deg)}}`}</style>
                    <div className="pointer-events-none absolute inset-0 opacity-60">
                        <div className="absolute -inset-y-12 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: "vehicular-sweep 4.6s linear infinite" }} />
                        <div className="absolute -inset-y-12 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/7 to-transparent" style={{ animation: "vehicular-sweep 4.6s linear infinite", animationDelay: "-2.3s" }} />
                    </div>
                    <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="mb-3 flex items-center justify-between">
                        <Logo />
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200">
                            Sign-in issue
                        </span>
                    </div>

                    <h1 className="text-sm font-medium text-rose-200">{error.message}</h1>
                    <p className="mt-2 text-xs text-zinc-400">
                        Try again, or use Google sign-in for the quickest flow.
                    </p>
                </div>
            </div>
        </div>
    )
}








    return !loading ? (
        <>

            <div className="relative min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:px-6 flex items-start justify-center overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)", backgroundSize: "26px 26px" }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-black" />
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(closest-side at 50% 10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(closest-side at 20% 80%, rgba(16,185,129,0.08), transparent 60%)" }} />
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 85%)" }} />
                </div>
                <div className="w-full max-w-md">
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur p-6 shadow-xl shadow-black/40">
                        <style>{`@keyframes vehicular-sweep{0%{transform:translateX(-160%) skewX(-18deg)}100%{transform:translateX(160%) skewX(-18deg)}}`}</style>
                        <div className="pointer-events-none absolute inset-0 opacity-55">
                            <div className="absolute -inset-y-12 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: "vehicular-sweep 4.6s linear infinite" }} />
                            <div className="absolute -inset-y-12 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/7 to-transparent" style={{ animation: "vehicular-sweep 4.6s linear infinite", animationDelay: "-2.3s" }} />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
                        <div className="pointer-events-none absolute -top-32 -right-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="mb-5 flex items-center justify-between">
                            <Logo />
                            <span className="rounded-full border border-zinc-700 bg-zinc-950/30 px-3 py-1 text-[11px] font-semibold text-zinc-200">
                                Privacy-first
                            </span>
                        </div>
                        <div className="mb-5">
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Sign in</h2>
                            <p className="mt-1 text-sm text-zinc-400">
                                Fast, private contact—no phone numbers. Use Google (recommended) or email.
                            </p>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/10 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
                            >
                                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                <div className="h-8 w-8 rounded-xl bg-zinc-950/20 ring-1 ring-zinc-950/10 flex items-center justify-center">
                                    <span className="text-base font-black leading-none">G</span>
                                </div>
                                <span className="tracking-wide">Google</span>
                                <span className="ml-auto inline-flex items-center rounded-xl bg-zinc-950/20 px-2.5 py-1 text-[11px] font-semibold text-zinc-900">
                                    Recommended
                                </span>
                            </button>

                            <p className="mt-2 text-xs text-zinc-500">
                                Tip: Google sign-in is fastest—no password to remember.
                            </p>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="rounded-full border border-zinc-800 bg-zinc-950/20 px-3 py-1 text-[11px] font-semibold text-zinc-300">Email sign-in</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">


                    <div>


                    <Input
                    type="text"
                    placeholder="email"
                    label = "Email"
                    className=""
                    {...register("email" , {

                        required: true,
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email",
                            }



                    }



                    )}

                    />
                    </div>

                    <div>
                        <Input
                        type="password"
                        placeholder="password"
                        label = "Password"
                        className=""
                        {...register("password" , {
                            required: true,
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            }
                        })}



                        />





                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center rounded-2xl border border-zinc-700/70 bg-zinc-800/70 px-4 py-3 text-sm font-semibold text-zinc-100 shadow-sm shadow-black/10 hover:bg-zinc-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
                        >
                            Continue with email
                        </button>
                    </div>




                </form>

                    </div>

                    <p className="mt-4 text-center text-xs text-zinc-500">
                        By continuing, you agree to use Vehicular responsibly.
                    </p>
                </div>

            </div>








        </>
    ) : (

        <>
            <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:px-6 flex items-start justify-center">
                <div className="w-full max-w-md">
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg shadow-black/30">
                        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
                        <div className="flex items-center justify-between">
                            <Logo />
                            <div className="h-2 w-24 rounded bg-zinc-800 animate-pulse" />
                        </div>
                        <h1 className="mt-6 text-sm text-zinc-400">Loading…</h1>
                    </div>
                </div>
            </div>




    </>

    )
}
