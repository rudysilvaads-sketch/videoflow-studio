 import { useState, useEffect, useCallback } from "react";
 
 interface ApiCredentials {
   geminiApiKey: string;
   imageFxCookies: string;
 }
 
 const CREDENTIALS_KEY = "lacasadark_credentials";
 
 const defaultCredentials: ApiCredentials = {
   geminiApiKey: "",
   imageFxCookies: "",
 };
 
 export function useCredentials() {
   const [credentials, setCredentials] = useState<ApiCredentials>(() => {
     if (typeof window === "undefined") return defaultCredentials;
     
     const stored = localStorage.getItem(CREDENTIALS_KEY);
     if (stored) {
       try {
         return { ...defaultCredentials, ...JSON.parse(stored) };
       } catch {
         return defaultCredentials;
       }
     }
     return defaultCredentials;
   });
 
   // Listen for storage changes (cross-tab sync)
   useEffect(() => {
     const handleStorageChange = (e: StorageEvent) => {
       if (e.key === CREDENTIALS_KEY && e.newValue) {
         try {
           setCredentials({ ...defaultCredentials, ...JSON.parse(e.newValue) });
         } catch {
           // ignore parse errors
         }
       }
     };
 
     window.addEventListener("storage", handleStorageChange);
     return () => window.removeEventListener("storage", handleStorageChange);
   }, []);
 
   const saveCredentials = useCallback((newCredentials: Partial<ApiCredentials>) => {
     setCredentials(prev => {
       const updated = { ...prev, ...newCredentials };
       localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
       return updated;
     });
   }, []);
 
   const clearCredentials = useCallback(() => {
     setCredentials(defaultCredentials);
     localStorage.removeItem(CREDENTIALS_KEY);
   }, []);
 
   return {
     credentials,
     saveCredentials,
     clearCredentials,
     hasGeminiKey: credentials.geminiApiKey.length > 0,
     hasImageFxCookies: credentials.imageFxCookies.length > 0,
   };
 }
 
 // Static getter for use outside of React components
 export function getCredentials(): ApiCredentials {
   if (typeof window === "undefined") return defaultCredentials;
   
   const stored = localStorage.getItem(CREDENTIALS_KEY);
   if (stored) {
     try {
       return { ...defaultCredentials, ...JSON.parse(stored) };
     } catch {
       return defaultCredentials;
     }
   }
   return defaultCredentials;
 }