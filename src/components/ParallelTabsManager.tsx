 import { useState, useEffect, useCallback, useRef } from "react";
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
    Trash2,
    PlayCircle,
    PauseCircle
 } from "lucide-react";
 import { toast } from "sonner";
import confetti from "canvas-confetti";
 
 interface ParallelTabsManagerProps {
   session: ParallelSession;
   onBack: () => void;
   onSessionUpdate: (session: ParallelSession) => void;
 }
 
 export function ParallelTabsManager({ session, onBack, onSessionUpdate }: ParallelTabsManagerProps) {
   const [currentSession, setCurrentSession] = useState(session);
   const [isRunning, setIsRunning] = useState(session.isRunning);
  const [realtimeProgress, setRealtimeProgress] = useState<Record<number, { progress: number; status: string }>>({});
  
  // Ref para sendPromptToTab para usar no useEffect sem dependência circular
  const sendPromptToTabRef = useRef<(tab: ParallelTab) => boolean>(() => false);
 
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
 
  // Atualizar aba pelo tabId do Chrome
  const updateTabByBrowserId = useCallback((browserTabId: number, updates: Partial<ParallelTab>) => {
    const tab = currentSession.tabs.find(t => t.tabId === browserTabId);
    if (tab) {
      updateTab(tab.id, updates);
    }
  }, [currentSession.tabs, updateTab]);
 
  // Escutar mensagens do background script para progresso em tempo real
  useEffect(() => {
    // @ts-ignore
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;
    
    const handleMessage = (message: any) => {
      console.log('[ParallelManager] Mensagem recebida:', message.type);
      
      // Progresso atualizado de uma aba
      if (message.type === 'PARALLEL_TAB_PROGRESS_UPDATE') {
        setRealtimeProgress(prev => ({
          ...prev,
          [message.tabId]: {
            progress: message.progress,
            status: message.status
          }
        }));
        
        // Atualizar completed count se disponível
        if (message.completedCount !== undefined) {
          updateTabByBrowserId(message.tabId, { 
            completedCount: message.completedCount 
          });
        }
      }
      
      // Aba fechada
      if (message.type === 'PARALLEL_TAB_CLOSED') {
        updateTabByBrowserId(message.tabId, { 
          status: 'error',
          tabId: undefined 
        });
        toast.warning(`Uma aba do Flow foi fechada`);
      }
      
      // Vídeo completado em uma aba
      if (message.type === 'VIDEO_COMPLETED' && message.tabId) {
        const tab = currentSession.tabs.find(t => t.tabId === message.tabId);
        if (tab) {
          const newCompletedCount = tab.completedCount + 1;
          const newPromptIndex = tab.currentPromptIndex + 1;
          
          updateTab(tab.id, {
            completedCount: newCompletedCount,
            currentPromptIndex: newPromptIndex,
            status: newPromptIndex >= tab.promptsAssigned.length ? 'ready' : 'processing'
          });
          
          toast.success(`Aba ${tab.id}: Prompt ${newCompletedCount}/${tab.promptsAssigned.length} concluído`);
          
          // Enviar próximo prompt se ainda houver
          if (isRunning && newPromptIndex < tab.promptsAssigned.length) {
            // Verificar se a aba não está pausada antes de enviar próximo prompt
            const currentTab = currentSession.tabs.find(t => t.id === tab.id);
            if (currentTab && !currentTab.isPaused) {
            setTimeout(() => {
              sendPromptToTabRef.current({ ...tab, currentPromptIndex: newPromptIndex });
            }, 1000);
            }
          }
        }
      }
      
      // Progresso de 65% atingido
      if (message.type === 'PROGRESS_THRESHOLD_REACHED' && message.tabId) {
        setRealtimeProgress(prev => ({
          ...prev,
          [message.tabId]: {
            progress: message.progress,
            status: 'processing'
          }
        }));
      }
    };
    
    // @ts-ignore
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      // @ts-ignore
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [currentSession.tabs, isRunning, updateTab, updateTabByBrowserId]);
 
  // Polling para obter estado das abas do background
  useEffect(() => {
    if (!isRunning) return;
    
    const pollState = () => {
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        // @ts-ignore
        chrome.runtime.sendMessage({ type: 'GET_PARALLEL_TABS_STATE' }, (response: any) => {
          if (response?.success && response.state) {
            const newProgress: Record<number, { progress: number; status: string }> = {};
            Object.entries(response.state).forEach(([tabId, state]: [string, any]) => {
              newProgress[parseInt(tabId)] = {
                progress: state.progress || 0,
                status: state.status || 'pending'
              };
            });
            setRealtimeProgress(newProgress);
          }
        });
      }
    };
    
    // Poll every 2 seconds
    const interval = setInterval(pollState, 2000);
    pollState(); // Initial poll
    
    return () => clearInterval(interval);
  }, [isRunning]);
 
   // Open multiple tabs in Google Flow
   const openTabs = useCallback(async () => {
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      // Usar background script para abrir abas
      const promptsPerTab = currentSession.tabs.map(t => t.promptsAssigned.length);
      
      // @ts-ignore
      chrome.runtime.sendMessage({
        type: 'OPEN_PARALLEL_TABS',
        count: currentSession.tabs.length,
        sessionId: currentSession.id,
        promptsPerTab
      }, (response: any) => {
        if (response?.success && response.tabs) {
          response.tabs.forEach((openedTab: { tabId: number; index: number }) => {
            const tab = currentSession.tabs[openedTab.index];
            if (tab) {
              updateTab(tab.id, { tabId: openedTab.tabId, status: 'ready' });
            }
          });
          toast.success(`${response.tabs.length} abas abertas no Google Flow!`);
        } else {
          toast.error('Erro ao abrir abas');
         }
      });
    } else {
      // Fallback: abrir manualmente
      const flowUrl = 'https://labs.google/fx/pt/tools/flow';
      currentSession.tabs.forEach((tab, i) => {
        window.open(flowUrl, `_blank_${i}`);
        updateTab(tab.id, { status: 'ready' });
      });
      toast.success(`${currentSession.tabs.length} abas abertas!`);
     }
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
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage && tab.tabId) {
       // @ts-ignore
      chrome.runtime.sendMessage({
        type: 'INJECT_PARALLEL_PROMPT',
        tabId: tab.tabId,
         prompt,
         folderName: `${currentSession.downloadFolder}/tab-${tab.id.split('-')[1]}`,
         sceneNumber,
      }, (response: any) => {
        if (response?.success) {
          console.log(`[Parallel] Prompt enviado para aba ${tab.id}`);
        } else {
          console.error(`[Parallel] Erro ao enviar prompt:`, response?.error);
        }
       });
       return true;
     }
     
     return false;
   }, [currentSession]);
 
  // Atualizar ref quando sendPromptToTab mudar
  useEffect(() => {
    sendPromptToTabRef.current = sendPromptToTab;
  }, [sendPromptToTab]);
 
  // Detectar quando todos os prompts foram concluídos
  useEffect(() => {
    if (progress.completed === progress.total && progress.total > 0 && isRunning) {
      // Parar a execução
      setIsRunning(false);
      updateSession({ isRunning: false });
      
      // Mostrar notificação de sucesso
      toast.success("🎉 Todos os prompts foram concluídos!", {
        description: `${progress.total} vídeos gerados em ${currentSession.tabs.length} abas`,
        duration: 10000,
      });
      
      // Efeito de confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Notificação do sistema (se permitido)
      if (Notification.permission === "granted") {
        new Notification("Flow Automation", {
          body: `✅ Todos os ${progress.total} prompts foram concluídos!`,
          icon: "/icons/icon128.png"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [progress.completed, progress.total, isRunning, currentSession.tabs.length, updateSession]);

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
      if (tab.status === 'ready' && !tab.isPaused) {
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
 
  // Pausar/retomar aba individual
  const toggleTabPause = (tab: ParallelTab) => {
    const newPausedState = !tab.isPaused;
    updateTab(tab.id, { isPaused: newPausedState });
    
    if (newPausedState) {
      toast.info(`Aba ${tab.id.split('-')[1]} pausada`);
    } else {
      toast.success(`Aba ${tab.id.split('-')[1]} retomada`);
      // Se estava processando e foi retomada, enviar próximo prompt
      if (isRunning && tab.status === 'processing' && tab.currentPromptIndex < tab.promptsAssigned.length) {
        setTimeout(() => sendPromptToTab(tab), 500);
      }
    }
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
          return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
       case 'ready':
          return <Check className="w-3 h-3 text-accent" />;
       case 'processing':
         return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
       case 'error':
          return <AlertCircle className="w-3 h-3 text-destructive" />;
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
                      variant={tab.isPaused ? "default" : "ghost"}
                      size="icon"
                      className={`h-7 w-7 ${tab.isPaused ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                      onClick={() => toggleTabPause(tab)}
                      disabled={tab.status === 'pending' || tab.status === 'error'}
                      title={tab.isPaused ? 'Retomar aba' : 'Pausar aba'}
                    >
                      {tab.isPaused ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : (
                        <PauseCircle className="w-4 h-4" />
                      )}
                    </Button>
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
               
                {tab.isPaused && (
                  <div className="flex items-center gap-1 mb-2">
                    <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30">
                      <Pause className="w-2.5 h-2.5 mr-1" />
                      Pausada
                    </Badge>
                  </div>
                )}

               <Progress 
                 value={
                   tab.tabId && realtimeProgress[tab.tabId]?.progress 
                     ? realtimeProgress[tab.tabId].progress 
                     : (tab.completedCount / tab.promptsAssigned.length) * 100
                 } 
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