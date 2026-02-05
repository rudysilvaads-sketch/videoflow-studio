 import { useState, useEffect, useCallback } from "react";
 
 type Theme = "light" | "dark";
 
 const THEME_KEY = "characterflow-theme";
 
 export function useTheme() {
   const [theme, setTheme] = useState<Theme>(() => {
     // Check localStorage first
     if (typeof window !== "undefined") {
       const stored = localStorage.getItem(THEME_KEY);
       if (stored === "light" || stored === "dark") {
         return stored;
       }
       // Check system preference
       if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
         return "dark";
       }
     }
     return "dark"; // Default to dark for this app
   });
 
   useEffect(() => {
     const root = document.documentElement;
     
     if (theme === "dark") {
       root.classList.add("dark");
     } else {
       root.classList.remove("dark");
     }
     
     localStorage.setItem(THEME_KEY, theme);
   }, [theme]);
 
   // Listen for system theme changes
   useEffect(() => {
     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
     
     const handleChange = (e: MediaQueryListEvent) => {
       const stored = localStorage.getItem(THEME_KEY);
       // Only auto-switch if user hasn't set a preference
       if (!stored) {
         setTheme(e.matches ? "dark" : "light");
       }
     };
 
     mediaQuery.addEventListener("change", handleChange);
     return () => mediaQuery.removeEventListener("change", handleChange);
   }, []);
 
   const toggleTheme = useCallback(() => {
     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
   }, []);
 
   return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
 }