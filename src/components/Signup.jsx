import React, {useState} from "react";
import {auth , googleProvider} from "../firebaseConfig/firebase.js";
import { Input } from "./Input";
import {useForm} from "react-hook-form";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {authApi} from "../api/auth.js";
import {useDispatch} from "react-redux";
import {login as authLogin , logout as authLogout} from "../store/authSlice.js";
 import {useLocation, useNavigate} from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Logo } from "./Logo";




export const Signup = () => {

    const [error, setError] = useState({})
    const [loading, setLoading] = useState(false)
    const {register, handleSubmit} = useForm()
    const dispatch = useDispatch()

    const navigate  = useNavigate()
    const googleProvider = new GoogleAuthProvider();

    const location = useLocation()

    let pathAfterSubmit = location?.state?.from ? location?.state?.from : '/'
    pathAfterSubmit  = String(pathAfterSubmit)



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

        console.log("token " , idToken)
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-6 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-900/60 p-6 shadow-lg shadow-black/30">
                <h1 className="text-sm font-medium text-rose-200">{error.message}</h1>
            </div>
        </div>
    )
}








    return !loading ? (
        <>

            <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-6 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 shadow-lg shadow-black/30">
                    <div className="mb-6 flex items-center justify-between">
                        <Logo />
                    </div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Sign in</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Fast, private contact—no phone numbers. Use email/password or Google.
                        </p>
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
                            className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm shadow-black/20 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
                        >
                            Continue
                        </button>
                    </div>




                </form>



                <div className="mt-4">
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-zinc-950 px-2 text-xs text-zinc-500">or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-sm shadow-black/10 hover:bg-zinc-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                        Continue with Google
                    </button>
                </div>

            </div>

            </div>








        </>
    ) : (

        <>
            <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-6 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg shadow-black/30">
                    <div className="flex items-center justify-between">
                        <Logo />
                        <div className="h-2 w-24 rounded bg-zinc-800 animate-pulse" />
                    </div>
                    <h1 className="mt-6 text-sm text-zinc-400">Loading…</h1>
                </div>
            </div>




    </>

    )
}
