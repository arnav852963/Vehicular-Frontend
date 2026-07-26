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

    }, [isAuth , pathAfterSubmit , navigate]);


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
        <div className="relative min-h-screen bg-slate-900 text-slate-100 px-4 py-6 sm:px-6 flex items-start justify-center">
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-800/60 p-6 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                        <Logo />
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200">
                            Sign-in issue
                        </span>
                    </div>

                    <h1 className="text-sm font-medium text-rose-200">{error.message}</h1>
                    <p className="mt-2 text-xs text-slate-400">
                        Try again, or use Google sign-in for the quickest flow.
                    </p>
                </div>
            </div>
        </div>
    )
}

    return !loading ? (
        <>
            <div className="relative min-h-screen bg-slate-900 text-slate-100 px-4 py-6 sm:px-6 flex items-start justify-center">
                <div className="w-full max-w-md">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <Logo />
                            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-300">
                                Privacy-first
                            </span>
                        </div>
                        <div className="mb-5">
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Sign in</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Fast, private contact—no phone numbers. Use Google (recommended) or email.
                            </p>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-slate-50 shadow-md hover:bg-indigo-400 transition"
                            >
                                <div className="h-8 w-8 rounded-xl bg-slate-900/30 flex items-center justify-center">
                                    <span className="text-base font-black leading-none">G</span>
                                </div>
                                <span className="tracking-wide">Google</span>
                                <span className="ml-auto inline-flex items-center rounded-xl bg-slate-900/30 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                                    Recommended
                                </span>
                            </button>

                            <p className="mt-2 text-xs text-slate-400">
                                Tip: Google sign-in is fastest—no password to remember.
                            </p>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/60" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="rounded-full border border-slate-700/60 bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-400">Email sign-in</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="email"
                                    label="Email"
                                    className=""
                                    {...register("email", {
                                        required: true,
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email",
                                        }
                                    })}
                                />
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    placeholder="password"
                                    label="Password"
                                    className=""
                                    {...register("password", {
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
                                    className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition"
                                >
                                    Continue with email
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        By continuing, you agree to use Vehicular responsibly.
                    </p>
                </div>
            </div>
        </>
    ) : (
        <>
            <div className="relative min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="w-full max-w-md px-4 relative z-10">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-xl backdrop-blur">
                        <div className="flex flex-col items-center text-center gap-5 mt-4">
                            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                                <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400 border-r-indigo-400" />
                            </div>
                            
                            <div className="mb-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-100">Starting engine...</h2>
                                <p className="mt-1.5 text-sm text-slate-400 max-w-[200px] mx-auto">
                                    Hang tight, we're securely logging you in.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
