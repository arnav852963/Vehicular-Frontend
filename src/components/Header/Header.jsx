import React from "react";
import {LogOut} from "lucide-react";

import {Link, useNavigate} from "react-router-dom";
import {Logo} from "../Logo.jsx";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../../store/authSlice.js";
import {userApi} from "../../api/user.js";

export const Header = () => {
    const navigate = useNavigate()

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch()
    
    const handleLogout = async () => {
        try{
            const res = await userApi.userLogout()
            if(!res || !res?.data || res?.data?.statusCode !== 200){
                navigate('/')
                alert("Logout failed")
                
                
                
            }
            
            dispatch(logout())
            navigate('/signin')
            
            
            
        } catch (e) {
            navigate('/')
            alert("Logout failed")
            
        }
        
       
        
    }

    return (
        <div className="w-full">
            <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-slate-950/70 backdrop-blur supports-backdrop-filter:bg-slate-950/60">

                <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-4">

                    <div className="flex min-w-0 items-center">

                        <Link to='/' className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">

                            <div className="flex h-9 items-center">
                                <Logo/>
                            </div>

                        </Link>

                    </div>

                    <div className="flex items-center">

                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-100 shadow-sm transition active:scale-[0.98] hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                aria-label="Log out"
                                title="Log out"
                            >
                                <LogOut size={20}/>
                            </button>
                        )}

                    </div>

                </div>



            </header>


        </div>
    )


}

