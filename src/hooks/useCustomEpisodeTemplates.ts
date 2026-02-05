 import { useState, useEffect } from "react";
 import { EpisodeTemplate } from "@/types/episode";
 
 const STORAGE_KEY = "custom-episode-templates";
 
 export function useCustomEpisodeTemplates() {
   const [customTemplates, setCustomTemplates] = useState<EpisodeTemplate[]>([]);
 
   useEffect(() => {
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored) {
       try {
         setCustomTemplates(JSON.parse(stored));
       } catch (e) {
         console.error("Erro ao carregar templates personalizados:", e);
       }
     }
   }, []);
 
   const saveTemplate = (template: Omit<EpisodeTemplate, "id">) => {
     const newTemplate: EpisodeTemplate = {
       ...template,
       id: `custom-${Date.now()}`,
     };
     const updated = [...customTemplates, newTemplate];
     setCustomTemplates(updated);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
     return newTemplate;
   };
 
   const updateTemplate = (id: string, template: Partial<EpisodeTemplate>) => {
     const updated = customTemplates.map(t => 
       t.id === id ? { ...t, ...template } : t
     );
     setCustomTemplates(updated);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
   };
 
   const deleteTemplate = (id: string) => {
     const updated = customTemplates.filter(t => t.id !== id);
     setCustomTemplates(updated);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
   };
 
   const exportTemplates = () => {
     const blob = new Blob([JSON.stringify(customTemplates, null, 2)], { type: "application/json" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "episode-templates.json";
     a.click();
     URL.revokeObjectURL(url);
   };
 
   const importTemplates = (jsonString: string) => {
     try {
       const imported = JSON.parse(jsonString) as EpisodeTemplate[];
       const withNewIds = imported.map(t => ({
         ...t,
         id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       }));
       const updated = [...customTemplates, ...withNewIds];
       setCustomTemplates(updated);
       localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
       return withNewIds.length;
     } catch (e) {
       console.error("Erro ao importar templates:", e);
       return 0;
     }
   };
 
   return {
     customTemplates,
     saveTemplate,
     updateTemplate,
     deleteTemplate,
     exportTemplates,
     importTemplates,
   };
 }