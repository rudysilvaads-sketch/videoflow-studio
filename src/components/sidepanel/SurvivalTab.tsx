 import { useState, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { 
   User, 
   MapPin, 
   Layers, 
   Wand2,
   ChevronLeft,
   Compass,
   Film
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { SeriesManager } from "./SeriesManager";
 import { ScenarioLibrary } from "./ScenarioLibrary";
 import { SurvivorProfile } from "./SurvivorProfile";
 import { PromptBuilder } from "./PromptBuilder";
 import { EpisodeManager } from "./EpisodeManager";
 import { Series, Episode, Scenario } from "@/types/series";
 import { survivorCharacterTemplate, survivalScenarios } from "@/data/survivalScenarios";
 import { cn } from "@/lib/utils";
 
 const STORAGE_KEY = "survival-channel-data";
 
 interface StoredData {
   series: Series[];
   survivor: {
     name: string;
     basePrompt: string;
     isLocked: boolean;
     visualStyle: string;
     avatarUrl?: string;
     avatarSeed?: number;
   };
 }
 
 interface SurvivalTabProps {
   onPromptReady: (prompt: string) => void;
 }
 
 export function SurvivalTab({ onPromptReady }: SurvivalTabProps) {
   const [activeView, setActiveView] = useState<"main" | "build">("main");
   const [activeSubTab, setActiveSubTab] = useState<"episodes" | "scenarios" | "character">("episodes");
   const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
   const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
   const [activeSeries, setActiveSeries] = useState<string | undefined>();
   
   // Persistent data
   const [series, setSeries] = useState<Series[]>([]);
   const [survivor, setSurvivor] = useState<{
     name: string;
     basePrompt: string;
     isLocked: boolean;
     visualStyle: string;
     avatarUrl?: string;
     avatarSeed?: number;
   }>({
     name: survivorCharacterTemplate.name,
     basePrompt: survivorCharacterTemplate.basePrompt,
     isLocked: true,
     visualStyle: survivorCharacterTemplate.visualStyle || "",
     avatarUrl: undefined,
     avatarSeed: undefined,
   });
 
   // Load from storage
   useEffect(() => {
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored) {
       try {
         const data: StoredData = JSON.parse(stored);
         if (data.series) setSeries(data.series);
         if (data.survivor) setSurvivor(data.survivor);
       } catch (e) {
         console.error("Failed to load survival data:", e);
       }
     }
   }, []);
 
   // Save to storage
   useEffect(() => {
     const data: StoredData = { series, survivor };
     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
   }, [series, survivor]);
 
   const handleSelectScenario = (scenario: Scenario) => {
     setSelectedScenario(scenario);
     setActiveView("build");
   };
 
   const handleSelectEpisode = (episode: Episode, seriesTitle: string) => {
     setSelectedEpisode(episode);
     setActiveSeries(seriesTitle);
     
     // Find the scenario for this episode
     const scenario = survivalScenarios.find(s => s.id === episode.scenario);
     if (scenario) {
       setSelectedScenario(scenario);
       setActiveView("build");
     }
   };
 
   const handlePromptGenerated = (prompt: string) => {
     onPromptReady(prompt);
   };
 
   const handleSendToQueue = (prompts: string[]) => {
     // Envia todos os prompts separados por linha em branco para o prompt principal
     const joinedPrompts = prompts.join('\n\n');
     onPromptReady(joinedPrompts);
   };
 
   return (
      <div className="h-full flex flex-col min-h-0">
       <AnimatePresence mode="wait">
         {activeView === "main" ? (
           <motion.div
             key="main"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col min-h-0"
           >
             {/* Header */}
              <div className="px-3 py-2 border-b border-border shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5 text-primary-foreground" />
                 </div>
                 <div>
                    <h2 className="text-xs font-bold">Canal de Sobrevivência</h2>
                   <p className="text-[10px] text-muted-foreground">
                     O Último Humano • ASMR Pós-Apocalíptico
                   </p>
                 </div>
               </div>
 
               {/* Sub Navigation */}
               <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}>
                  <TabsList className="w-full h-7 p-0.5 bg-muted/50">
                   <TabsTrigger 
                     value="episodes" 
                      className="flex-1 h-6 text-[10px] gap-1 data-[state=active]:bg-background"
                   >
                     <Film className="w-3 h-3" />
                     Episódios
                   </TabsTrigger>
                   <TabsTrigger 
                     value="scenarios" 
                      className="flex-1 h-6 text-[10px] gap-1 data-[state=active]:bg-background"
                   >
                     <MapPin className="w-3 h-3" />
                     Cenários
                   </TabsTrigger>
                   <TabsTrigger 
                     value="character" 
                      className="flex-1 h-6 text-[10px] gap-1 data-[state=active]:bg-background"
                   >
                     <User className="w-3 h-3" />
                     Personagem
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
             </div>
 
             {/* Content */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                 <AnimatePresence mode="wait">
                   {activeSubTab === "episodes" && (
                     <motion.div
                       key="episodes"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                     >
                       <EpisodeManager
                         characterPrompt={survivor.basePrompt}
                         visualStyle={survivor.visualStyle}
                         onSendToQueue={handleSendToQueue}
                       />
                     </motion.div>
                   )}
 
                   {activeSubTab === "scenarios" && (
                     <motion.div
                       key="scenarios"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                     >
                       <ScenarioLibrary
                         onSelectScenario={handleSelectScenario}
                         selectedScenarioId={selectedScenario?.id}
                       />
                     </motion.div>
                   )}
 
                   {activeSubTab === "character" && (
                     <motion.div
                       key="character"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                     >
                       <SurvivorProfile
                         profile={survivor}
                         onProfileChange={setSurvivor}
                       />
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             </ScrollArea>
           </motion.div>
         ) : (
           <motion.div
             key="build"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col min-h-0"
           >
             {/* Build Header */}
              <div className="px-3 py-2 border-b border-border shrink-0">
               <div className="flex items-center gap-2">
                 <Button
                   variant="ghost"
                   size="sm"
                    className="h-6 w-6 p-0"
                   onClick={() => setActiveView("main")}
                 >
                   <ChevronLeft className="w-4 h-4" />
                 </Button>
                 <div>
                    <h2 className="text-xs font-bold flex items-center gap-1">
                     <Wand2 className="w-4 h-4 text-primary" />
                     Construir Prompt
                   </h2>
                   <p className="text-[10px] text-muted-foreground">
                     {selectedScenario?.name || "Selecione um cenário"}
                   </p>
                 </div>
               </div>
             </div>
 
             {/* Build Content */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                 <PromptBuilder
                   characterPrompt={survivor.basePrompt}
                   isCharacterLocked={survivor.isLocked}
                   selectedScenario={selectedScenario}
                   onGeneratePrompt={handlePromptGenerated}
                 />
               </div>
             </ScrollArea>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 }