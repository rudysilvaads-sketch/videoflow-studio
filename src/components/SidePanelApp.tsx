import { useState, useEffect, useRef, useCallback } from "react";
  import { Reorder } from "framer-motion";
 import { motion, AnimatePresence } from "framer-motion";
import { Character } from "@/types/character";
import { getPromptHistory, clearPromptHistory } from "@/lib/promptHistory";
import { 
  BatchSession, 
  BatchPromptItem,
  getCurrentBatch, 
  saveBatch, 
  createBatchFromText,
  clearBatch,
  appendToBatch,
  updateBatchItem,
  getNextPendingItem,
  getBatchProgress
} from "@/lib/batchQueue";
import { SidePanelCharacterForm } from "@/components/SidePanelCharacterForm";
 import { ParallelModeSetup } from "@/components/ParallelModeSetup";
 import { ParallelTabsManager } from "@/components/ParallelTabsManager";
 import { 
   ParallelSession, 
   getParallelSession, 
   saveParallelSession,
   clearParallelSession 
 } from "@/lib/parallelTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Play, 
  Square, 
  Settings, 
  Clock, 
  Wrench,
  Upload,
  FolderPlus,
  ListPlus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Send,
  Plus,
  User,
  RotateCcw,
  Copy,
  X,
  Download,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  GripVertical,
  Layers,
  Sparkles,
  Video,
  Zap,
  Compass
} from "lucide-react";
import { SurvivalTab } from "@/components/sidepanel";
 import { SettingsTab } from "@/components/sidepanel";
import { toast } from "sonner";
import logoDark from "@/assets/logo-lacasadark.png";

const STORAGE_KEY = 'lacasadark_characters';
const SETTINGS_KEY = 'lacasadark_settings';
const LOG_KEY = 'lacasadark_log';

const FLOW_URL = 'https://labs.google/fx/pt/tools/flow';

function isFlowUrl(url: string): boolean {
  // Requisito: só liberar interface completa quando estiver na página do Flow.
  // Mantém compatibilidade com URLs antigas.
  const u = (url || '').toLowerCase();
  return (
    (u.includes('labs.google/fx') && u.includes('/tools/flow')) ||
    u.includes('labs.google.com/veo') ||
    u.includes('aitestkitchen.withgoogle.com')
  );
}

interface AppSettings {
  videosPerTask: number;
  model: string;
  ratio: string;
  startFrom: number;
  waitTimeMin: number;
  waitTimeMax: number;
  language: string;
  autoDownload: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const defaultSettings: AppSettings = {
  videosPerTask: 1,
  model: 'veo-3.1-fast',
  ratio: '16:9',
  startFrom: 1,
  waitTimeMin: 30,
  waitTimeMax: 60,
  language: 'pt',
  autoDownload: true,
};

const defaultCharacters: Character[] = [
  {
    id: "1",
    name: "Narrador Sombrio",
    description: "Um narrador misterioso com voz grave e presença enigmática",
    basePrompt: "A mysterious male narrator figure, dark hooded cloak, face partially hidden in shadows, glowing eyes, cinematic lighting, dark fantasy style, highly detailed, 8k resolution, consistent character design",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    attributes: {
      age: "Atemporal",
      gender: "Masculino",
      style: "Dark Fantasy",
      features: ["Encapuzado", "Olhos brilhantes", "Presença sombria"],
    },
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Detetive Noir",
    description: "Investigador clássico dos anos 40 em preto e branco",
    basePrompt: "1940s noir detective, fedora hat, trench coat, cigarette smoke, black and white film grain effect, moody lighting, rain-soaked streets background, highly detailed, cinematic, consistent character",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    attributes: {
      age: "40 anos",
      gender: "Masculino",
      style: "Film Noir",
      features: ["Chapéu fedora", "Sobretudo", "Cigarro"],
    },
    createdAt: new Date(),
  },
];

export function SidePanelApp() {
  const [activeTab, setActiveTab] = useState("control");
  const [characters, setCharacters] = useState<Character[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCharacters;
      }
    }
    return defaultCharacters;
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("none");
   const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showQueueManager, setShowQueueManager] = useState(false);
  const [showParallelSetup, setShowParallelSetup] = useState(false);
  const [parallelSession, setParallelSession] = useState<ParallelSession | null>(() => getParallelSession());
  const [batchText, setBatchText] = useState("");
  const [folderName, setFolderName] = useState("LaCasaDark_Scenes");
  const [batchSession, setBatchSession] = useState<BatchSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [historyItems, setHistoryItems] = useState(() => getPromptHistory());
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { return { ...defaultSettings, ...JSON.parse(stored) }; } 
      catch { return defaultSettings; }
    }
    return defaultSettings;
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const stored = localStorage.getItem(LOG_KEY);
    if (stored) {
      try { 
        return JSON.parse(stored).map((l: LogEntry) => ({ ...l, timestamp: new Date(l.timestamp) })); 
      } catch { return []; }
    }
    return [];
  });
  const [failedTasks, setFailedTasks] = useState<BatchPromptItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
   const processNextItemRef = useRef<() => void>(() => {});
  
  // Estado para detecção de página
  const [isOnFlowPage, setIsOnFlowPage] = useState(false);
  const [flowPageReady, setFlowPageReady] = useState(false);
  const [checkingPage, setCheckingPage] = useState(true);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;
   const selectedCharacters = characters.filter(c => selectedCharacterIds.includes(c.id));
  const promptLines = batchText.split('\n').filter(line => line.trim().length > 0);
  const promptCount = promptLines.length;
  const progress = batchSession ? getBatchProgress(batchSession) : { completed: 0, total: 0, percentage: 0 };

  // Add log entry
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type,
    };
    setLogs(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      localStorage.setItem(LOG_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save characters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Load existing batch on mount
  useEffect(() => {
    const existingBatch = getCurrentBatch();
    if (existingBatch) {
      setBatchSession(existingBatch);
      setIsRunning(existingBatch.isRunning);
      addLog('log_config_loaded_successfully', 'success');
    }
    
    // Load parallel session if exists
    const existingParallel = getParallelSession();
    if (existingParallel) {
      setParallelSession(existingParallel);
    }
  }, []);

  // Update history when tab changes
  useEffect(() => {
    if (activeTab === "history") {
      setHistoryItems(getPromptHistory());
    }
  }, [activeTab]);

  // Verificar se está na página do Flow
  const checkFlowPage = useCallback(() => {
     // Tentar ping direto ao content script primeiro
     // @ts-ignore
     if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
       // @ts-ignore
       window.chrome.runtime.sendMessage({ type: 'PING_CONTENT_SCRIPT' }, (response: any) => {
         if (response?.active && response?.url) {
           const isFlow = isFlowUrl(response.url);
           if (isFlow && !isOnFlowPage) {
             setIsOnFlowPage(true);
             setFlowPageReady(true);
             setCheckingPage(false);
           } else if (!isFlow && isOnFlowPage) {
             setIsOnFlowPage(false);
             setFlowPageReady(false);
             setCheckingPage(false);
           }
           return;
         }
       });
     }
 
    // @ts-ignore
    if (typeof window !== 'undefined' && window.chrome?.tabs?.query) {
      // @ts-ignore
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs[0]?.url) {
          const url = tabs[0].url;
            const isFlow = isFlowUrl(url);
          
          // Só atualizar se mudou para evitar re-renders
          if (isFlow !== isOnFlowPage) {
            setIsOnFlowPage(isFlow);
          }
          
          if (isFlow) {
            // Verificar se o campo está pronto
            // @ts-ignore
            window.chrome.runtime.sendMessage({ type: 'CHECK_PAGE_READY' }, (response: any) => {
              const ready = response?.ready || false;
              if (ready !== flowPageReady) {
                setFlowPageReady(ready);
              }
              if (checkingPage) {
                setCheckingPage(false);
              }
            });
          } else {
            if (flowPageReady) setFlowPageReady(false);
            if (checkingPage) setCheckingPage(false);
          }
        } else {
          if (checkingPage) setCheckingPage(false);
        }
      });
    } else {
      // Fallback para contexto preview
      if (!isOnFlowPage) setIsOnFlowPage(true);
      if (!flowPageReady) setFlowPageReady(true);
      if (checkingPage) setCheckingPage(false);
    }
  }, [isOnFlowPage, flowPageReady, checkingPage]);

  // Verificar página ao montar e periodicamente
  useEffect(() => {
    checkFlowPage();
     // Verificar menos frequentemente (10s) e só se necessário
     const interval = setInterval(() => {
       // Só checar se ainda não conectou ou se está em dúvida
       if (!isOnFlowPage || !flowPageReady) {
         checkFlowPage();
       }
     }, 10000);
    return () => clearInterval(interval);
  }, [checkFlowPage, isOnFlowPage, flowPageReady]);
 
   // Escutar mensagens do background (FLOW_PAGE_READY, PROGRESS_THRESHOLD_REACHED)
   useEffect(() => {
     // @ts-ignore
     if (typeof window !== 'undefined' && window.chrome?.runtime?.onMessage) {
       const listener = (message: any) => {
         console.log('[SidePanel] Mensagem recebida:', message.type);
         
         if (message.type === 'FLOW_PAGE_READY') {
           setIsOnFlowPage(true);
           setFlowPageReady(true);
           setCheckingPage(false);
           addLog('Conectado ao Google Flow', 'success');
         }
         
         if (message.type === 'PROGRESS_THRESHOLD_REACHED' && isRunning && batchSession) {
           // Quando atingir 65%, enviar próximo prompt
           const currentProcessing = batchSession.items.find(i => i.status === 'processing');
           if (currentProcessing) {
             // Marcar item atual como "downloading" (ainda baixando, mas podemos enviar o próximo)
             const updatedSession = updateBatchItem(batchSession, currentProcessing.id, { 
               status: 'downloading' 
             });
             setBatchSession(updatedSession);
             saveBatch(updatedSession);
             
             addLog(`Cena ${currentProcessing.sceneNumber} em ${message.progress}%, enviando próxima...`, 'info');
             toast.info(`⏭️ ${message.progress}% - Enviando próximo prompt...`);
             
             // Enviar próximo prompt
             setTimeout(() => {
               processNextItemRef.current();
             }, 500);
           }
         }
       };
       
       // @ts-ignore
       window.chrome.runtime.onMessage.addListener(listener);
       return () => {
         // @ts-ignore
         window.chrome.runtime.onMessage.removeListener(listener);
       };
     }
   }, [isRunning, batchSession, addLog]);

  const handleSaveCharacter = (data: Omit<Character, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      setCharacters(prev => prev.map(c => 
        c.id === data.id ? { ...c, ...data, createdAt: c.createdAt } : c
      ));
    } else {
      const newCharacter: Character = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      setCharacters(prev => [newCharacter, ...prev]);
      setSelectedCharacterId(newCharacter.id);
    }
    setShowCharacterForm(false);
    toast.success("Personagem salvo!");
  };

  // Abrir Google Flow em nova aba
  const openGoogleFlow = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.chrome?.tabs?.create) {
      // @ts-ignore
      window.chrome.tabs.create({ url: FLOW_URL });
    } else {
      window.open(FLOW_URL, '_blank');
    }
    addLog('Opened Google Flow in new tab', 'info');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBatchText(content);
      toast.success(`Arquivo importado: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Import character from JSON
  const handleImportCharacterJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const newChar: Character = {
          id: crypto.randomUUID(),
          name: data.name || 'Imported Character',
          description: data.description || '',
          basePrompt: data.basePrompt || data.prompt || '',
          imageUrl: data.imageUrl || data.image || '',
          attributes: data.attributes || { age: '', gender: '', style: '', features: [] },
          createdAt: new Date(),
        };
        setCharacters(prev => [newChar, ...prev]);
        toast.success(`Personagem "${newChar.name}" importado!`);
        addLog(`Imported character: ${newChar.name}`, 'success');
      } catch {
        toast.error("Arquivo JSON inválido");
        addLog('Failed to import character: invalid JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export queue as txt
  const handleExportQueue = () => {
    if (!batchSession || batchSession.items.length === 0) {
      toast.error("Fila vazia");
      return;
    }
    
    const content = batchSession.items.map((item, idx) => 
      `# Scene ${String(idx + 1).padStart(2, '0')}\n${item.prompt}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}_queue.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Queue exportada!");
    addLog(`Exported queue with ${batchSession.items.length} items`, 'success');
  };

  // Download all completed videos
  const handleDownloadAllVideos = () => {
    if (!batchSession) {
      toast.error("Nenhuma fila ativa");
      return;
    }
    
    const completedItems = batchSession.items.filter(item => item.status === 'completed' && item.videoUrl);
    
    if (completedItems.length === 0) {
      toast.error("Nenhum vídeo concluído para baixar");
      return;
    }
    
    completedItems.forEach(item => {
      if (item.videoUrl) {
        // @ts-ignore
        if (window.chrome?.runtime?.sendMessage) {
          // @ts-ignore
          window.chrome.runtime.sendMessage({
            type: 'DOWNLOAD_VIDEO',
            url: item.videoUrl,
            filename: `${folderName}/cena-${String(item.sceneNumber).padStart(2, '0')}.mp4`
          });
        }
      }
    });
    
    toast.success(`Baixando ${completedItems.length} vídeos...`);
    addLog(`Downloading ${completedItems.length} videos`, 'success');
  };

  // Configure download folder - opens Chrome settings
  const handleConfigureFolder = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.chrome?.tabs?.create) {
      // @ts-ignore
      window.chrome.tabs.create({ url: 'chrome://settings/downloads' });
      toast.info("Configure a pasta de download no Chrome");
      addLog('Opened Chrome download settings', 'info');
    } else {
      toast.info("Abra chrome://settings/downloads para configurar");
    }
  };

  const handleAddToQueue = () => {
    if (promptCount === 0) {
      toast.error("Cole pelo menos um prompt");
      return;
    }

     // Combinar prompts de múltiplos personagens
     let combinedBasePrompt = '';
     let combinedCharacterNames = '';
     
     if (selectedCharacterIds.length > 0) {
       combinedBasePrompt = selectedCharacters
         .map(c => c.basePrompt)
         .join('\n\n[AND]\n\n');
       combinedCharacterNames = selectedCharacters.map(c => c.name).join(' + ');
     } else if (selectedCharacter) {
       combinedBasePrompt = selectedCharacter.basePrompt;
       combinedCharacterNames = selectedCharacter.name;
     }
 
     // Sempre criar novo batch (substituir o anterior) ao invés de acumular
     clearBatch();
     const session = createBatchFromText(batchText, {
       characterId: selectedCharacterIds.length > 0 ? selectedCharacterIds.join(',') : selectedCharacter?.id,
       characterName: combinedCharacterNames || undefined,
       characterBasePrompt: combinedBasePrompt || undefined,
     });
    session.downloadFolder = folderName;
    
    setBatchSession(session);
    saveBatch(session);
    setBatchText("");
     const charCount = selectedCharacterIds.length || (selectedCharacter ? 1 : 0);
     addLog(`Adicionado ${promptCount} prompts com ${charCount} personagem(s)`, 'success');
    toast.success(`${promptCount} cenas adicionadas à fila!`);
  };

  const handleClearQueue = () => {
    clearBatch();
    setBatchSession(null);
    setIsRunning(false);
    addLog('Queue cleared', 'info');
    toast.info("Fila limpa");
  };

  // Send prompt to Flow
  const sendPromptToFlow = useCallback((prompt: string, sceneNumber: number) => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      // @ts-ignore
      window.chrome.runtime.sendMessage({
        type: 'INJECT_BATCH_PROMPT',
        prompt,
        folderName: batchSession?.downloadFolder || folderName,
        sceneNumber,
        settings: {
          model: settings.model,
          ratio: settings.ratio,
          videosPerTask: settings.videosPerTask,
        },
      });
      return true;
    }
    return false;
  }, [batchSession?.downloadFolder, folderName, settings]);

   const processNextItem = useCallback(() => {
    if (!batchSession) return;
    
    const nextItem = getNextPendingItem(batchSession);
    if (!nextItem) {
      setIsRunning(false);
      const updated = { ...batchSession, isRunning: false };
      setBatchSession(updated);
      saveBatch(updated);
      addLog('Batch completed successfully!', 'success');
      toast.success("🎉 Lote concluído!");
      return;
    }

    const updated = updateBatchItem(batchSession, nextItem.id, { status: 'sending' });
    setBatchSession(updated);

    const sent = sendPromptToFlow(nextItem.prompt, nextItem.sceneNumber);
    
    if (sent) {
      const processing = updateBatchItem(updated, nextItem.id, { status: 'processing' });
      setBatchSession(processing);
      saveBatch(processing);
      addLog(`Prompt ${nextItem.sceneNumber} injected into Flow`, 'info');
      toast.info(`🚀 Cena ${nextItem.sceneNumber} enviada ao Flow`);
    } else {
      navigator.clipboard.writeText(nextItem.prompt);
      const processing = updateBatchItem(updated, nextItem.id, { status: 'processing' });
      setBatchSession(processing);
      saveBatch(processing);
      addLog(`Prompt ${nextItem.sceneNumber} copied to clipboard (extension not active)`, 'warning');
      toast.warning(`📋 Cena ${nextItem.sceneNumber} copiada! Cole no Flow.`);
    }
  }, [batchSession, sendPromptToFlow]);
 
   // Manter ref atualizada
   useEffect(() => {
     processNextItemRef.current = processNextItem;
   }, [processNextItem]);

  // Listen for completion messages
  useEffect(() => {
    // Handler para mensagens do Chrome extension
    const handleChromeMessage = (message: any) => {
      console.log('[SidePanel] Mensagem Chrome recebida:', message.type);
      
      if (message.type === 'VIDEO_COMPLETED') {
        if (batchSession) {
          // Procurar item em processing OU downloading
          const processingItem = batchSession.items.find(
            item => item.status === 'processing' || item.status === 'downloading'
          );
          if (processingItem) {
            const updated = updateBatchItem(batchSession, processingItem.id, { 
              status: 'completed',
              videoUrl: message.videoUrl,
              downloadedAt: new Date(),
            });
            setBatchSession(updated);
            saveBatch(updated);
            addLog(`Scene ${processingItem.sceneNumber} completed and downloaded`, 'success');
            toast.success(`✅ Cena ${processingItem.sceneNumber} concluída!`);
            
            // Só processar próximo se não tiver nenhum em processamento (já foi enviado em 65%)
            const hasProcessing = updated.items.some(i => i.status === 'processing' || i.status === 'sending');
            if (isRunning && !hasProcessing) {
              setTimeout(() => processNextItemRef.current(), 1000);
            }
          }
        }
      }
      
      if (message.type === 'VIDEO_ERROR') {
        if (batchSession) {
          const processingItem = batchSession.items.find(
            item => item.status === 'processing' || item.status === 'downloading'
          );
          if (processingItem) {
            const updated = updateBatchItem(batchSession, processingItem.id, { 
              status: 'error',
              errorMessage: message.error,
            });
            setBatchSession(updated);
            saveBatch(updated);
            setFailedTasks(prev => [...prev, { ...processingItem, status: 'error', errorMessage: message.error }]);
            addLog(`Scene ${processingItem.sceneNumber} failed: ${message.error}`, 'error');
            
            if (isRunning) {
              setTimeout(() => processNextItemRef.current(), 2000);
            }
          }
        }
      }
    };

    // @ts-ignore - chrome is defined only in extension context
    if (typeof window !== 'undefined' && window.chrome?.runtime?.onMessage) {
      // @ts-ignore
      window.chrome.runtime.onMessage.addListener(handleChromeMessage);
    }
    
    // Também escutar window messages como fallback
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type) {
        handleChromeMessage(event.data);
      }
    };
    window.addEventListener('message', handleWindowMessage);
    
    return () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.chrome?.runtime?.onMessage) {
        // @ts-ignore
        window.chrome.runtime.onMessage.removeListener(handleChromeMessage);
      }
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [batchSession, isRunning, addLog]);

  const handleStartQueue = () => {
    if (!batchSession || batchSession.items.length === 0) {
      toast.error("Adicione prompts à fila primeiro");
      return;
    }
    setIsRunning(true);
    const updated = { ...batchSession, isRunning: true };
    setBatchSession(updated);
    saveBatch(updated);
    processNextItem();
    addLog('Queue started', 'success');
    toast.success("Fila iniciada!");
  };

  const handleStopQueue = () => {
    setIsRunning(false);
    if (batchSession) {
      const updated = { ...batchSession, isRunning: false };
      setBatchSession(updated);
      saveBatch(updated);
    }
    addLog('Queue stopped by user', 'warning');
    toast.info("Fila pausada");
  };

  const handleRetryItem = (item: BatchPromptItem) => {
    if (!batchSession) return;
    const updated = updateBatchItem(batchSession, item.id, { status: 'pending', errorMessage: undefined });
    setBatchSession(updated);
    saveBatch(updated);
  };

  const getStatusIcon = (status: BatchPromptItem['status']) => {
    switch (status) {
      case 'pending': return <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />;
    case 'sending': return <Send className="w-3 h-3 text-primary animate-pulse" />;
      case 'processing': return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case 'downloading': return <Download className="w-3 h-3 text-accent animate-pulse" />;
    case 'completed': return <Check className="w-3 h-3 text-accent" />;
    case 'error': return <AlertCircle className="w-3 h-3 text-destructive" />;
    }
  };

  const copyFailedPrompts = () => {
    const failed = failedTasks.map(t => t.prompt).join('\n\n');
    navigator.clipboard.writeText(failed);
    toast.success('Failed prompts copied to clipboard');
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '🟢';
      case 'error': return '🔴';
      case 'warning': return '🟡';
      default: return '⚪';
    }
  };

  if (showCharacterForm) {
    return (
      <SidePanelCharacterForm
        onSave={handleSaveCharacter}
        onClose={() => setShowCharacterForm(false)}
      />
    );
  }
 
  // Parallel Mode Setup Screen
  if (showParallelSetup) {
    return (
      <ParallelModeSetup
        onBack={() => setShowParallelSetup(false)}
        onSessionCreated={(session) => {
          setParallelSession(session);
          setShowParallelSetup(false);
        }}
      />
    );
  }
 
  // Parallel Tabs Manager Screen
  if (parallelSession) {
    return (
      <ParallelTabsManager
        session={parallelSession}
        onBack={() => {
          clearParallelSession();
          setParallelSession(null);
        }}
        onSessionUpdate={(session) => {
          setParallelSession(session);
          saveParallelSession(session);
        }}
      />
    );
  }

  // Não mostrar a interface completa fora do Flow — apenas a tela de conexão.
  if (!checkingPage && !isOnFlowPage) {
    return (
      <div className="h-screen w-full bg-background flex flex-col overflow-hidden extension-panel">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 border-b border-border gradient-header"
        >
          <motion.img 
            src={logoDark} 
            alt="LaCasaDark" 
            className="h-12 w-12 rounded-xl shadow-card"
            whileHover={{ scale: 1.05, rotate: 5 }}
          />
          <div>
            <h1 className="font-bold text-base text-gradient">LaCasaDark Flow</h1>
            <p className="text-sm text-muted-foreground">Gerador de Vídeos com IA</p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <motion.div 
              className="w-24 h-24 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(265 85% 60% / 0.2)",
                  "0 0 40px hsl(265 85% 60% / 0.3)",
                  "0 0 20px hsl(265 85% 60% / 0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Video className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold mb-3">Conecte ao Google Flow</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Abra o Google Flow para gerar vídeos com IA de forma automatizada.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-10"
          >
            {[
              { icon: Sparkles, text: "Consistência de personagens" },
              { icon: Zap, text: "Processamento em lote" },
              { icon: Video, text: "Download automático" },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button 
              onClick={openGoogleFlow} 
              className="w-full h-14 gap-3 text-base font-semibold shadow-button"
            >
              <ExternalLink className="w-5 h-5" />
              Abrir Google Flow
            </Button>

            <Button
              variant="ghost"
              className="w-full h-11 text-sm gap-2 text-muted-foreground"
              onClick={checkFlowPage}
            >
              <RefreshCw className="w-4 h-4" />
              Verificar Conexão
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-5 border-t border-border text-center"
        >
          <p className="text-xs text-muted-foreground/60">
            Funciona apenas em <span className="font-mono">labs.google/fx/tools/flow</span>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden extension-panel">
      {/* Hidden input for JSON import */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleImportCharacterJSON}
        className="hidden"
      />

      {/* Queue Manager Dialog */}
      <Dialog open={showQueueManager} onOpenChange={setShowQueueManager}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Task Queue Manager</DialogTitle>
          </DialogHeader>
          <div className="border-b border-border pb-2 mb-2">
            <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground gap-2">
              <span>#</span>
              <span className="col-span-2">DESCRIPTION</span>
              <span>PROGRESS</span>
              <span>ACTIONS</span>
            </div>
          </div>
          <ScrollArea className="h-64">
            {!batchSession || batchSession.items.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No tasks in queue. Add tasks from the Control tab.
              </p>
            ) : (
              <div className="space-y-2">
                {batchSession.items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-5 text-xs gap-2 items-center p-2 rounded bg-card border border-border">
                    <span className="font-mono">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="col-span-2 truncate">{item.prompt.slice(0, 30)}...</span>
                    <span>{getStatusIcon(item.status)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRetryItem(item)}
                      disabled={item.status !== 'error'}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1.5"
              onClick={() => {
                if (batchSession) {
                  const resetItems = batchSession.items.map(i => ({ ...i, status: 'pending' as const, errorMessage: undefined }));
                  const updated = { ...batchSession, items: resetItems, isRunning: false };
                  setBatchSession(updated);
                  saveBatch(updated);
                  setIsRunning(false);
                  addLog('Queue reset', 'info');
                }
              }}
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={handleClearQueue}
            >
              <Trash2 className="w-3 h-3" />
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-3 py-2 border-b border-border gradient-header"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img src={logoDark} alt="LaCasaDark" className="h-9 w-9 rounded-lg shadow-card" />
          </motion.div>
          <div>
            <h1 className="font-bold text-sm text-gradient">LaCasaDark Flow</h1>
            <p className="text-xs text-muted-foreground">Gerador de Vídeos com IA</p>
          </div>
        </div>
        
        {checkingPage && (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        )}
      </motion.div>

      {/* Flow Detection Banner */}
      {!isOnFlowPage && !checkingPage && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-3 py-2 bg-destructive/10 border-b border-destructive/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Desconectado</span>
          </div>
          <Button 
            onClick={openGoogleFlow}
            size="sm"
            className="w-full h-8 gap-2 text-xs"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Google Flow
          </Button>
        </motion.div>
      )}

      {/* Connected indicator */}
      {isOnFlowPage && !checkingPage && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-3 py-1.5 bg-accent/10 border-b border-accent/30 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-xs text-accent font-medium">Conectado ao Google Flow</span>
          {!flowPageReady && (
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Carregando...
            </span>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-10">
          <TabsTrigger 
            value="control" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-3 py-2 transition-all"
          >
            <Play className="w-4 h-4" />
            Controle
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-3 py-2 transition-all"
          >
            <Settings className="w-4 h-4" />
            Config
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-3 py-2 transition-all"
          >
            <Clock className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-3 py-2 transition-all"
          >
            <Wrench className="w-4 h-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger 
            value="survival" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-3 py-2 transition-all"
          >
            <Compass className="w-4 h-4" />
            Sobrevivência
          </TabsTrigger>
        </TabsList>

        {/* Control Tab */}
        <TabsContent value="control" className="flex-1 flex flex-col overflow-hidden mt-0 p-0 min-h-0">
          {/* Sem ScrollArea: a aba Controle deve caber inteira (no-scroll) */}
          <div className="flex-1 overflow-hidden">
            <div className="p-3 space-y-3">
              {/* Character Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground/90">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    Personagens
                    {selectedCharacterIds.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {selectedCharacterIds.length} selecionado{selectedCharacterIds.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedCharacterIds([])}
                    disabled={selectedCharacterIds.length === 0}
                  >
                    Limpar
                  </Button>
                </div>
                 <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
                   <div className="max-h-24 overflow-y-auto scrollbar-thin p-2 space-y-1">
                   {characters.length === 0 ? (
                     <div className="text-center py-2">
                       <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
                       <p className="text-xs text-muted-foreground">Nenhum personagem criado</p>
                     </div>
                   ) : (
                     characters.map(char => (
                       <motion.label 
                         key={char.id} 
                         whileHover={{ scale: 1.01 }}
                         whileTap={{ scale: 0.99 }}
                         className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                           selectedCharacterIds.includes(char.id) 
                             ? 'bg-primary/15 border border-primary/40 shadow-sm' 
                             : 'hover:bg-muted/50 border border-transparent'
                         }`}
                       >
                         <input
                           type="checkbox"
                           checked={selectedCharacterIds.includes(char.id)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedCharacterIds(prev => [...prev, char.id]);
                             } else {
                               setSelectedCharacterIds(prev => prev.filter(id => id !== char.id));
                             }
                           }}
                           className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                         />
                         {char.imageUrl ? (
                           <img src={char.imageUrl} alt="" className="w-7 h-7 rounded-md object-cover ring-1 ring-border" />
                         ) : (
                           <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                             <User className="w-3.5 h-3.5 text-muted-foreground" />
                           </div>
                         )}
                         <div className="flex-1 min-w-0">
                           <span className="text-xs font-medium truncate block">{char.name}</span>
                           {char.attributes?.style && (
                             <span className="text-[10px] text-muted-foreground">{char.attributes.style}</span>
                           )}
                         </div>
                       </motion.label>
                     ))
                   )}
                   </div>
                   
                   {/* Create New Button */}
                   <div className="p-2 border-t border-border bg-muted/30">
                     <Button 
                       variant="ghost" 
                       size="sm"
                       className="w-full h-7 text-xs gap-1.5 justify-center hover:bg-primary/10 hover:text-primary"
                       onClick={() => setShowCharacterForm(true)}
                     >
                       <Plus className="w-3.5 h-3.5" />
                       Criar Novo Personagem
                     </Button>
                   </div>
                 </div>
                 
                 {selectedCharacters.length > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-2 rounded-lg bg-primary/5 border border-primary/20"
                  >
                      <p className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Arraste para reordenar (primeiro = principal)
                      </p>
                      <Reorder.Group 
                        axis="y" 
                        values={selectedCharacterIds} 
                        onReorder={setSelectedCharacterIds}
                        className="space-y-1"
                      >
                        {selectedCharacterIds.map((charId, index) => {
                          const char = characters.find(c => c.id === charId);
                          if (!char) return null;
                          return (
                            <Reorder.Item 
                              key={charId}
                              value={charId}
                              whileDrag={{ 
                                scale: 1.02, 
                                boxShadow: "0 8px 20px -5px rgba(0,0,0,0.3)",
                                zIndex: 50
                              }}
                              className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border group cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                                {index + 1}
                              </Badge>
                              {char.imageUrl && (
                                <img src={char.imageUrl} alt="" className="w-5 h-5 rounded-md object-cover pointer-events-none" />
                              )}
                              <span className="text-xs flex-1 truncate pointer-events-none">{char.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCharacterIds(prev => prev.filter(id => id !== charId));
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                  </motion.div>
                )}
              </motion.div>

              {/* Prompt List */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground/90">
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <FileText className="w-3.5 h-3.5 text-accent" />
                    </div>
                    Lista de Prompts
                    {promptCount > 0 && (
                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-accent/20 text-accent border-0">
                        {promptCount} cena{promptCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-[10px] gap-1.5 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Importar .txt
                  </Button>
                </div>
                <Textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`🎬 Primeira cena - descrição detalhada...
Continue descrevendo a mesma cena aqui.

🎬 Segunda cena - nova descrição...
Com detalhes visuais e cinematográficos.

🎬 Terceira cena - e assim por diante...

💡 Dica: Linhas em branco separam as cenas!`}
                  className="min-h-[100px] text-xs font-mono resize-none rounded-lg bg-card/50 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/40"
                />
                <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent/50" />
                  Cada bloco separado por linha em branco = uma cena
                </p>
              </motion.div>

              {/* Download Folder */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-1.5"
              >
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground/90">
                  <div className="p-1.5 rounded-md bg-muted">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  Pasta de Download
                </Label>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="MeuProjeto_Cenas"
                  className="h-8 text-xs rounded-md bg-card/50"
                />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-8 text-xs gap-1.5 border-muted-foreground/20"
                  onClick={() => setShowQueueManager(true)}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Gerenciar ({batchSession?.items.length || 0})
                </Button>
                <Button 
                  className="flex-1 h-8 text-xs gap-1.5 shadow-button"
                  onClick={handleAddToQueue}
                  disabled={promptCount === 0}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Adicionar à Fila
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={handleClearQueue}
                  disabled={!batchSession}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Progress */}
              {batchSession && batchSession.items.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium flex items-center gap-1.5">
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span className="text-primary">Processando...</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Pronto para iniciar</span>
                      )}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                    {/* Reset button when stuck */}
                    {(isRunning || batchSession.items.some(i => i.status === 'processing' || i.status === 'sending')) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-6 mt-1 text-[10px] text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          // Reset all processing/sending items to pending
                          const resetItems = batchSession.items.map(item => 
                            item.status === 'processing' || item.status === 'sending'
                              ? { ...item, status: 'pending' as const }
                              : item
                          );
                          const resetSession = { ...batchSession, items: resetItems, isRunning: false };
                          setBatchSession(resetSession);
                          saveBatch(resetSession);
                          setIsRunning(false);
                          addLog('Fila resetada - itens travados voltaram para pendente', 'warning');
                          toast.info("Fila resetada");
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Resetar itens travados
                      </Button>
                    )}
                </motion.div>
              )}

              {/* Start/Stop Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 h-9 gap-1.5 text-xs shadow-button"
                  onClick={handleStartQueue}
                  disabled={isRunning || !batchSession || batchSession.items.length === 0}
                >
                  <Play className="w-4 h-4" />
                  Iniciar Fila
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1 h-9 gap-1.5 text-xs"
                  onClick={handleStopQueue}
                  disabled={!isRunning}
                >
                  <Square className="w-3.5 h-3.5" />
                  Parar
                </Button>
              </div>
 
              {/* Parallel Mode Button */}
              <div className="pt-1.5 border-t border-border">
                <Button 
                  variant="outline"
                  className="w-full h-7 gap-1.5 text-[10px] border-dashed border-primary/40 text-primary hover:bg-primary/5"
                  onClick={() => setShowParallelSetup(true)}
                  disabled={isRunning || (batchSession?.items.length || 0) === 0}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Modo Paralelo (Múltiplas Abas)
                </Button>
                {(batchSession?.items.length || 0) === 0 ? (
                  <p className="text-[9px] text-destructive text-center mt-1">
                    Adicione prompts à fila primeiro para usar o modo paralelo
                  </p>
                ) : (
                  <p className="text-[9px] text-muted-foreground text-center mt-1">
                    Abre várias abas do Flow para processar prompts simultaneamente
                  </p>
                )}
              </div>

              {/* Queue Items Preview */}
              {batchSession && batchSession.items.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-semibold text-muted-foreground">
                      Fila de Processamento
                    </Label>
                    <Badge variant="outline" className="text-[9px]">
                      {batchSession.items.length} itens
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin pr-1">
                    <AnimatePresence mode="popLayout">
                      {batchSession.items.map((item) => (
                        <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`p-1.5 rounded-md border text-[10px] flex items-start gap-2 transition-colors ${
                          item.status === 'processing' ? 'bg-primary/10 border-primary/30' :
                          item.status === 'downloading' ? 'bg-accent/10 border-accent/30' :
                        item.status === 'completed' ? 'bg-accent/20 border-accent/40' :
                        item.status === 'error' ? 'bg-destructive/10 border-destructive/30' :
                          'bg-card border-border'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{getStatusIcon(item.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                              {String(item.sceneNumber).padStart(2, '0')}
                            </Badge>
                             {item.status === 'completed' && (
                               <span className="text-accent text-[9px]">✓</span>
                             )}
                             {item.status === 'processing' && (
                               <span className="text-primary text-[9px]">Gerando...</span>
                             )}
                          </div>
                          <p className="text-muted-foreground line-clamp-1 mt-0.5 text-[9px]">{item.prompt}</p>
                          {item.errorMessage && (
                            <p className="text-destructive text-[9px] mt-0.5">{item.errorMessage}</p>
                          )}
                        </div>
                        {item.status === 'error' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 shrink-0 hover:bg-destructive/10"
                            onClick={() => handleRetryItem(item)}
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
         <TabsContent value="settings" className="flex-1 overflow-auto mt-0">
           <SettingsTab 
             settings={settings} 
             onSettingsChange={setSettings}
           />
           
           {/* Character Management - mantido separadamente */}
           <div className="px-4 pb-4">
             <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
               <User className="w-4 h-4 text-primary" />
               Personagens
             </h3>
             <div className="space-y-2">
               {characters.map(char => (
                 <div key={char.id} className="p-2.5 rounded-xl border border-border bg-card flex items-center gap-2.5">
                   {char.imageUrl && (
                     <img src={char.imageUrl} alt={char.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-border" />
                   )}
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium truncate">{char.name}</p>
                     <p className="text-[10px] text-muted-foreground truncate">{char.attributes.style}</p>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-7 w-7 text-destructive hover:text-destructive"
                     onClick={() => setCharacters(prev => prev.filter(c => c.id !== char.id))}
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                 </div>
               ))}
               <Button 
                 variant="outline" 
                 className="w-full h-9 text-xs gap-1.5 border-dashed"
                 onClick={() => setShowCharacterForm(true)}
               >
                 <Plus className="w-3.5 h-3.5" />
                 Adicionar Personagem
               </Button>
             </div>
           </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-auto mt-0 p-4 space-y-4">
          {/* Detailed Log */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Log Detalhado
            </h3>
            <ScrollArea className="h-48 rounded-xl border border-border bg-card/50 p-3">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum log ainda</p>
              ) : (
                <div className="space-y-1">
                  {logs.map(log => (
                    <div key={log.id} className="text-xs font-mono flex items-start gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span>{getLogIcon(log.type)}</span>
                      <span className="text-foreground/80">[{log.message}]</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Failed Tasks */}
          <div>
            <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tarefas com Erro ({failedTasks.length})
            </h3>
            <ScrollArea className="h-24 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
              {failedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhuma tarefa com erro</p>
              ) : (
                <div className="space-y-1">
                  {failedTasks.map((task, idx) => (
                    <div key={task.id} className="text-xs flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">{idx + 1}</Badge>
                      <span className="truncate text-muted-foreground">{task.prompt.slice(0, 50)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Button 
              variant="outline" 
              className="w-full h-9 mt-2 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={copyFailedPrompts}
              disabled={failedTasks.length === 0}
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Prompts com Erro
            </Button>
          </div>

          {/* Prompt History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Histórico de Prompts
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] text-destructive"
                onClick={() => {
                  clearPromptHistory();
                  setHistoryItems([]);
                  toast.success("Histórico limpo");
                }}
                disabled={historyItems.length === 0}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            </div>
            {historyItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum histórico ainda</p>
            ) : (
              <div className="space-y-1.5">
                {historyItems.slice(0, 10).map(item => (
                  <div key={item.id} className="p-2.5 rounded-xl border border-border bg-card text-xs hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Badge variant="secondary" className="text-[9px] px-1">{item.characterName}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{item.userPrompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="flex-1 overflow-auto mt-0 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            Ferramentas Úteis
          </h3>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full h-11 justify-start gap-3 text-sm rounded-xl border-border hover:border-primary/30"
              onClick={handleExportQueue}
              disabled={!batchSession || batchSession.items.length === 0}
            >
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Exportar Fila</p>
                <p className="text-[10px] text-muted-foreground">Salvar prompts como .txt</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-11 justify-start gap-3 text-sm rounded-xl border-border hover:border-accent/30"
              onClick={handleDownloadAllVideos}
              disabled={!batchSession || batchSession.items.filter(i => i.status === 'completed').length === 0}
            >
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Download className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Baixar Todos os Vídeos</p>
                <p className="text-[10px] text-muted-foreground">Download de vídeos concluídos</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-11 justify-start gap-3 text-sm rounded-xl border-border hover:border-muted-foreground/30"
              onClick={() => jsonInputRef.current?.click()}
            >
              <div className="p-1.5 rounded-lg bg-muted">
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">Importar Personagem</p>
                <p className="text-[10px] text-muted-foreground">Carregar de arquivo JSON</p>
              </div>
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium">Dica Pro</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Use o modo paralelo para processar até 4 vídeos simultaneamente em abas diferentes!
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Survival Tab */}
        <TabsContent value="survival" className="flex-1 overflow-hidden mt-0 p-0 min-h-0 flex flex-col">
          <SurvivalTab 
            onPromptReady={(prompt) => {
              // Add the generated prompt to the batch text
              setBatchText(prev => prev ? `${prev}\n\n${prompt}` : prompt);
              setActiveTab("control");
              toast.success("Prompt adicionado à fila!");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}