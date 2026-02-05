 import { useState, useEffect, useCallback } from "react";
 import { 
   ParallelSession, 
   ParallelTab,
   saveParallelSession,
   clearParallelSession,
   getParallelProgress 
 } from "@/lib/parallelTabs";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   ChevronLeft, 
   Play, 
   Pause, 
   RotateCcw,
   ExternalLink,
   Loader2,
   Check,
   AlertCircle,
   Layers,
   Trash2
 } from "lucide-react";
 import { toast } from "sonner";
 
 interface ParallelTabsManagerProps {
   session: ParallelSession;
   onBack: () => void;
   onSessionUpdate: (session: ParallelSession) => void;
 }
 
 export function ParallelTabsManager({ session, onBack, onSessionUpdate }: ParallelTabsManagerProps) {
   const [currentSession, setCurrentSession] = useState(session);
   const [isRunning, setIsRunning] = useState(session.isRunning);
 
   const progress = getParallelProgress(currentSession);
 
   const updateSession = useCallback((updates: Partial<ParallelSession>) => {
     const updated = { ...currentSession, ...updates };
     setCurrentSession(updated);
     saveParallelSession(updated);
     onSessionUpdate(updated);
   }, [currentSession, onSessionUpdate]);
 
   const updateTab = useCallback((tabId: string, updates: Partial<ParallelTab>) => {
     const updatedTabs = currentSession.tabs.map(tab =>
       tab.id === tabId ? { ...tab, ...updates } : tab
     );
     updateSession({ tabs: updatedTabs });
   }, [currentSession, updateSession]);
 
   // Open multiple tabs in Google Flow
   const openTabs = useCallback(async () => {
     const flowUrl = 'https://labs.google/fx/pt/tools/flow';
     
     for (let i = 0; i < currentSession.tabs.length; i++) {
       const tab = currentSession.tabs[i];
       
       updateTab(tab.id, { status: 'opening' });
       
       // @ts-ignore - chrome is defined only in extension context
       if (typeof chrome !== 'undefined' && chrome.tabs) {
         try {
           // @ts-ignore
           const newTab = await chrome.tabs.create({ url: flowUrl, active: i === 0 });
           updateTab(tab.id, { tabId: newTab.id, status: 'ready' });
           
           // Small delay between opening tabs
           await new Promise(resolve => setTimeout(resolve, 500));
         } catch (error) {
           console.error('Error opening tab:', error);
           updateTab(tab.id, { status: 'error' });
         }
       } else {
         // Fallback: open in new window
         window.open(flowUrl, `_blank_${i}`);
         updateTab(tab.id, { status: 'ready' });
       }
     }
     
     toast.success(`${currentSession.tabs.length} abas abertas no Google Flow!`);
   }, [currentSession.tabs, updateTab]);
 
   // Send prompt to a specific tab
   const sendPromptToTab = useCallback((tab: ParallelTab) => {
     if (tab.currentPromptIndex >= tab.promptsAssigned.length) {
       return false; // No more prompts for this tab
     }
     
     const promptIndex = tab.promptsAssigned[tab.currentPromptIndex];
     const prompt = currentSession.allPrompts[promptIndex];
     const sceneNumber = promptIndex + 1;
     
     // @ts-ignore
     if (typeof chrome !== 'undefined' && chrome.tabs && tab.tabId) {
       // @ts-ignore
       chrome.tabs.sendMessage(tab.tabId, {
         type: 'INJECT_BATCH_PROMPT',
         prompt,
         folderName: `${currentSession.downloadFolder}/tab-${tab.id.split('-')[1]}`,
         sceneNumber,
       });
       return true;
     }
     
     return false;
   }, [currentSession]);
 
   // Start all tabs processing
   const handleStart = async () => {
     // First open all tabs if not already open
     const needsOpening = currentSession.tabs.some(t => !t.tabId);
     
     if (needsOpening) {
       await openTabs();
       // Wait for tabs to load
       await new Promise(resolve => setTimeout(resolve, 2000));
     }
     
     setIsRunning(true);
     updateSession({ isRunning: true });
     
     // Send first prompt to each tab
     currentSession.tabs.forEach(tab => {
       if (tab.status === 'ready') {
         sendPromptToTab(tab);
         updateTab(tab.id, { status: 'processing' });
       }
     });
     
     toast.success("Processamento paralelo iniciado!");
   };
 
   const handlePause = () => {
     setIsRunning(false);
     updateSession({ isRunning: false });
     toast.info("Processamento pausado");
   };
 
   const handleOpenSingleTab = () => {
     const flowUrl = 'https://labs.google/fx/pt/tools/flow';
     window.open(flowUrl, '_blank');
   };
 
   const handleReset = () => {
     const resetTabs = currentSession.tabs.map(tab => ({
       ...tab,
       status: 'pending' as const,
       tabId: undefined,
       currentPromptIndex: 0,
       completedCount: 0,
     }));
     
     updateSession({ 
       tabs: resetTabs, 
       isRunning: false,
     });
     setIsRunning(false);
     toast.info("Sessão reiniciada");
   };
 
   const handleClear = () => {
     clearParallelSession();
     onBack();
     toast.success("Sessão removida");
   };
 
   // Copy prompts for a specific tab
   const copyTabPrompts = (tab: ParallelTab) => {
     const prompts = tab.promptsAssigned.map(idx => currentSession.allPrompts[idx]).join('\n\n---\n\n');
     navigator.clipboard.writeText(prompts);
     toast.success(`${tab.promptsAssigned.length} prompts copiados para a aba ${tab.id}`);
   };
 
   const getTabStatusIcon = (status: ParallelTab['status']) => {
     switch (status) {
       case 'pending':
         return <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />;
       case 'opening':
         return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
       case 'ready':
         return <Check className="w-3 h-3 text-green-500" />;
       case 'processing':
         return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
       case 'error':
         return <AlertCircle className="w-3 h-3 text-red-500" />;
     }
   };
 
   return (
     <div className="flex flex-col h-full">
       {/* Header */}
       <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
           <ChevronLeft className="w-4 h-4" />
         </Button>
         <div className="flex-1">
           <p className="font-medium text-sm flex items-center gap-1.5">
             <Layers className="w-4 h-4 text-primary" />
             Modo Paralelo
           </p>
           <p className="text-xs text-muted-foreground">
             {currentSession.tabs.length} abas × {currentSession.promptsPerTab} prompts cada
           </p>
         </div>
         <Badge 
           variant={isRunning ? "default" : "secondary"} 
           className={`text-xs ${isRunning ? 'animate-pulse' : ''}`}
         >
           {isRunning ? 'Executando' : 'Pausado'}
         </Badge>
       </div>
 
       {/* Progress */}
       <div className="p-3 space-y-2 border-b border-border">
         <div className="flex justify-between text-xs">
           <span className="text-muted-foreground">Progresso Total</span>
           <span className="font-medium">{progress.completed}/{progress.total} prompts</span>
         </div>
         <Progress value={progress.percentage} className="h-2" />
       </div>
 
       {/* Controls */}
       <div className="flex gap-2 p-3 border-b border-border">
         {!isRunning ? (
           <Button 
             onClick={handleStart} 
             variant="glow" 
             size="sm" 
             className="flex-1"
             disabled={progress.completed === progress.total}
           >
             <Play className="w-4 h-4 mr-1" />
             {currentSession.tabs.some(t => t.tabId) ? 'Continuar' : 'Abrir Abas e Iniciar'}
           </Button>
         ) : (
           <Button 
             onClick={handlePause} 
             variant="secondary" 
             size="sm" 
             className="flex-1"
           >
             <Pause className="w-4 h-4 mr-1" />
             Pausar
           </Button>
         )}
         
         <Button 
           onClick={handleReset} 
           variant="outline" 
           size="sm"
           disabled={isRunning}
         >
           <RotateCcw className="w-4 h-4" />
         </Button>
         
         <Button 
           onClick={handleClear} 
           variant="ghost" 
           size="sm"
           className="text-destructive hover:text-destructive"
           disabled={isRunning}
         >
           <Trash2 className="w-4 h-4" />
         </Button>
       </div>
 
       {/* Tabs List */}
       <ScrollArea className="flex-1">
         <div className="p-3 space-y-3">
           {currentSession.tabs.map((tab, index) => (
             <div 
               key={tab.id}
               className={`p-3 rounded-lg border transition-colors ${
                 tab.status === 'processing' 
                   ? 'bg-primary/10 border-primary/30' 
                   : tab.status === 'ready'
                   ? 'bg-green-500/10 border-green-500/30'
                   : tab.status === 'error'
                   ? 'bg-red-500/10 border-red-500/30'
                   : 'bg-card border-border'
               }`}
             >
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   {getTabStatusIcon(tab.status)}
                   <span className="font-medium text-sm">Aba {index + 1}</span>
                   <Badge variant="outline" className="text-[10px]">
                     {tab.promptsAssigned.length} prompts
                   </Badge>
                 </div>
                 
                 <div className="flex items-center gap-1">
                   <Button
                     variant="ghost"
                     size="sm"
                     className="h-7 text-xs"
                     onClick={() => copyTabPrompts(tab)}
                   >
                     Copiar
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-7 w-7"
                     onClick={handleOpenSingleTab}
                   >
                     <ExternalLink className="w-3 h-3" />
                   </Button>
                 </div>
               </div>
               
               <Progress 
                 value={(tab.completedCount / tab.promptsAssigned.length) * 100} 
                 className="h-1.5 mb-2" 
               />
               
               <p className="text-[10px] text-muted-foreground">
                 {tab.completedCount}/{tab.promptsAssigned.length} concluídos
               </p>
               
               {/* Preview of prompts */}
               <div className="mt-2 space-y-1">
                 {tab.promptsAssigned.slice(0, 3).map((promptIdx) => (
                   <p 
                     key={promptIdx} 
                     className={`text-[10px] truncate ${
                       promptIdx < tab.currentPromptIndex 
                         ? 'text-green-600 line-through' 
                         : promptIdx === tab.currentPromptIndex && tab.status === 'processing'
                         ? 'text-primary font-medium'
                         : 'text-muted-foreground'
                     }`}
                   >
                     {promptIdx + 1}. {currentSession.allPrompts[promptIdx]?.substring(0, 50)}...
                   </p>
                 ))}
                 {tab.promptsAssigned.length > 3 && (
                   <p className="text-[10px] text-muted-foreground/50">
                     +{tab.promptsAssigned.length - 3} mais...
                   </p>
                 )}
               </div>
             </div>
           ))}
         </div>
       </ScrollArea>
 
       {/* Instructions */}
       <div className="p-3 border-t border-border bg-muted/30">
         <p className="text-[10px] text-muted-foreground text-center">
           💡 Cada aba processará seus prompts de forma independente.
           Mantenha as abas do Flow abertas e visíveis.
         </p>
       </div>
     </div>
   );
 }