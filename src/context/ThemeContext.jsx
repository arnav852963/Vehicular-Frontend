import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("vehicular_theme") || "dusk";
    });

    useEffect(() => {
        localStorage.setItem("vehicular_theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "beige") {
            document.documentElement.classList.add("theme-beige");
            document.documentElement.classList.remove("theme-dusk");
        } else {
            document.documentElement.classList.add("theme-dusk");
            document.documentElement.classList.remove("theme-beige");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dusk" ? "beige" : "dusk"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        return { theme: "dusk", toggleTheme: () => {} };
    }
    return context;
};
