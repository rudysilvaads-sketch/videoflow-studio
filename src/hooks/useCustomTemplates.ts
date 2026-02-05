 import { useState, useEffect } from "react";
 import { CharacterTemplate } from "@/data/characterTemplates";
 
 const STORAGE_KEY = "custom-character-templates";
 
 export interface CustomTemplate extends CharacterTemplate {
   isCustom: true;
   createdAt: string;
 }
 
 export function useCustomTemplates() {
   const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
 
   // Load from localStorage on mount
   useEffect(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) {
         setCustomTemplates(JSON.parse(stored));
       }
     } catch (error) {
       console.error("Error loading custom templates:", error);
     }
   }, []);
 
   // Save to localStorage whenever templates change
   const saveToStorage = (templates: CustomTemplate[]) => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
     } catch (error) {
       console.error("Error saving custom templates:", error);
     }
   };
 
   const addCustomTemplate = (template: Omit<CustomTemplate, "id" | "isCustom" | "createdAt">) => {
     const newTemplate: CustomTemplate = {
       ...template,
       id: `custom-${Date.now()}`,
       isCustom: true,
       createdAt: new Date().toISOString(),
     };
     
     const updated = [...customTemplates, newTemplate];
     setCustomTemplates(updated);
     saveToStorage(updated);
     return newTemplate;
   };
 
   const removeCustomTemplate = (id: string) => {
     const updated = customTemplates.filter(t => t.id !== id);
     setCustomTemplates(updated);
     saveToStorage(updated);
   };
 
   const isCustomTemplate = (id: string) => {
     return customTemplates.some(t => t.id === id);
   };
 
   return {
     customTemplates,
     addCustomTemplate,
     removeCustomTemplate,
     isCustomTemplate,
   };
 }