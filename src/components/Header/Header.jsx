import React from "react";
import {LogOut, Sun, Moon} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {Logo} from "../Logo.jsx";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../../store/authSlice.js";
import {userApi} from "../../api/user.js";
import {useTheme} from "../../context/ThemeContext.jsx";

export const Header = () => {
    const navigate = useNavigate();
    const {theme, toggleTheme} = useTheme();

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    
    const handleLogout = async () => {
        try {
            const res = await userApi.userLogout();
            if(!res || !res?.data || res?.data?.statusCode !== 200) {
                navigate('/');
                alert("Logout failed");
            }
            dispatch(logout());
            navigate('/signup');
        } catch (e) {
            navigate('/');
            alert("Logout failed");
        }
    };

    const isBeige = theme === "beige";

    return (
        <div className="w-full">
            <header className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-colors duration-200 ${
                isBeige 
                    ? "border-amber-200/80 bg-amber-50/85 text-stone-900" 
                    : "border-slate-800/70 bg-slate-950/70 text-slate-100"
            }`}>
                <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-3 px-4">
                    <div className="flex min-w-0 items-center">
                        <Link to='/' className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70">
                            <div className="flex h-9 items-center">
                                <Logo/>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition active:scale-[0.97] ${
                                isBeige
                                    ? "border-amber-300 bg-amber-100/80 text-amber-900 hover:bg-amber-200/70"
                                    : "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                            }`}
                            aria-label="Toggle theme"
                            title={`Switch to ${isBeige ? "Dusk" : "Beige"} theme`}
                        >
                            {isBeige ? <Sun size={15} className="text-amber-600" /> : <Moon size={15} className="text-indigo-400" />}
                            <span className="capitalize">{theme}</span>
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition active:scale-[0.98] ${
                                    isBeige
                                        ? "border-amber-200 bg-stone-100 text-stone-800 hover:bg-stone-200"
                                        : "border-slate-800 bg-slate-900/50 text-slate-100 hover:bg-slate-900"
                                }`}
                                aria-label="Log out"
                                title="Log out"
                            >
                                <LogOut size={18}/>
                            </button>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
};
