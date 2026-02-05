import { useState, useEffect, useRef, useCallback } from "react";
import { Character } from "@/types/character";
import { getPromptHistory, clearPromptHistory } from "@/lib/promptHistory";
import { 
  BatchSession, 
  BatchPromptItem,
  getCurrentBatch, 
  saveBatch, 
  createBatchFromText,
  clearBatch,
  updateBatchItem,
  getNextPendingItem,
  getBatchProgress
} from "@/lib/batchQueue";
import { SidePanelCharacterForm } from "@/components/SidePanelCharacterForm";
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
  FileText
} from "lucide-react";
import { toast } from "sonner";
import logoDark from "@/assets/logo-lacasadark.png";

const STORAGE_KEY = 'lacasadark_characters';
const SETTINGS_KEY = 'lacasadark_settings';
const LOG_KEY = 'lacasadark_log';

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
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showQueueManager, setShowQueueManager] = useState(false);
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

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;
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
  }, []);

  // Update history when tab changes
  useEffect(() => {
    if (activeTab === "history") {
      setHistoryItems(getPromptHistory());
    }
  }, [activeTab]);

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

  const handleAddToQueue = () => {
    if (promptCount === 0) {
      toast.error("Cole pelo menos um prompt");
      return;
    }

    const session = createBatchFromText(batchText, {
      characterId: selectedCharacter?.id,
      characterName: selectedCharacter?.name,
      characterBasePrompt: selectedCharacter?.basePrompt,
    });
    session.downloadFolder = folderName;
    
    setBatchSession(session);
    saveBatch(session);
    setBatchText("");
    addLog(`Added ${promptCount} prompts to queue with folder: ${folderName}`, 'success');
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

  // Listen for completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!batchSession) return;
      
      if (event.data.type === 'VIDEO_COMPLETED') {
        const processingItem = batchSession.items.find(item => item.status === 'processing');
        if (processingItem) {
          const updated = updateBatchItem(batchSession, processingItem.id, { 
            status: 'completed',
            videoUrl: event.data.videoUrl,
            downloadedAt: new Date(),
          });
          setBatchSession(updated);
          saveBatch(updated);
          addLog(`Scene ${processingItem.sceneNumber} completed and downloaded`, 'success');
          toast.success(`✅ Cena ${processingItem.sceneNumber} concluída!`);
          
          if (isRunning) {
            setTimeout(processNextItem, 1000);
          }
        }
      }
      
      if (event.data.type === 'VIDEO_ERROR') {
        const processingItem = batchSession.items.find(item => item.status === 'processing');
        if (processingItem) {
          const updated = updateBatchItem(batchSession, processingItem.id, { 
            status: 'error',
            errorMessage: event.data.error,
          });
          setBatchSession(updated);
          saveBatch(updated);
          setFailedTasks(prev => [...prev, { ...processingItem, status: 'error', errorMessage: event.data.error }]);
          addLog(`Scene ${processingItem.sceneNumber} failed: ${event.data.error}`, 'error');
          
          if (isRunning) {
            setTimeout(processNextItem, 2000);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [batchSession, isRunning, processNextItem]);

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

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
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
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <img src={logoDark} alt="LaCasaDark" className="h-8 w-8 rounded-full" />
          <div>
            <h1 className="font-bold text-sm">LaCasaDark Flow</h1>
            <p className="text-xs text-muted-foreground">Character Consistency</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-10">
          <TabsTrigger 
            value="control" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-4"
          >
            <Play className="w-3.5 h-3.5" />
            Control
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-4"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-4"
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1.5 text-xs px-4"
          >
            <Wrench className="w-3.5 h-3.5" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Control Tab */}
        <TabsContent value="control" className="flex-1 flex flex-col overflow-hidden mt-0 p-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Character Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Personagem Consistente
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                    <SelectTrigger className="h-9 text-sm flex-1">
                      <SelectValue placeholder="Selecione um personagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum personagem</SelectItem>
                      {characters.map(char => (
                        <SelectItem key={char.id} value={char.id}>
                          <div className="flex items-center gap-2">
                            {char.imageUrl && (
                              <img src={char.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                            )}
                            {char.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 shrink-0"
                    onClick={() => setShowCharacterForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedCharacter && (
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2">
                      {selectedCharacter.imageUrl && (
                        <img 
                          src={selectedCharacter.imageUrl} 
                          alt={selectedCharacter.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{selectedCharacter.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedCharacter.attributes.style}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-mono bg-muted/30 p-1.5 rounded">
                      {selectedCharacter.basePrompt}
                    </p>
                  </div>
                )}
              </div>

              {/* Prompt List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    Prompt List
                    <span className="text-muted-foreground ml-1">(Sample .txt file)</span>
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
                    className="h-7 text-xs gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3" />
                    Import file (.txt)
                  </Button>
                </div>
                <Textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`First prompt.\nCan span multiple lines or be a JSON prompt.\n\nSecond prompt starts after a blank line.\n\nThird prompt is similar...`}
                  className="min-h-[120px] text-sm font-mono resize-none"
                />
              </div>

              {/* Download Folder */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Job Download Folder:</Label>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Flow-01"
                  className="h-9 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-xs gap-1.5 border-accent/50 text-accent-foreground hover:bg-accent/10"
                  onClick={() => setShowQueueManager(true)}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Manage ({batchSession?.items.length || 0})
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-xs gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
                  onClick={handleAddToQueue}
                  disabled={promptCount === 0}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Add to Queue
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={handleClearQueue}
                  disabled={!batchSession}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Progress */}
              {batchSession && batchSession.items.length > 0 && (
                <div className="space-y-2">
                  <Progress value={progress.percentage} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {isRunning ? 'Processing...' : 'Ready'} • {progress.completed}/{progress.total}
                  </p>
                </div>
              )}

              {/* Start/Stop Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="default"
                  className="flex-1 h-10 gap-2 bg-primary hover:bg-primary/90"
                  onClick={handleStartQueue}
                  disabled={isRunning || !batchSession || batchSession.items.length === 0}
                >
                  <Play className="w-4 h-4" />
                  Start Queue
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1 h-10 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={handleStopQueue}
                  disabled={!isRunning}
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </div>

              {/* Queue Items Preview */}
              {batchSession && batchSession.items.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Queue ({batchSession.items.length} items)</Label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {batchSession.items.map((item) => (
                      <div 
                        key={item.id}
                        className={`p-2 rounded border text-xs flex items-start gap-2 ${
                          item.status === 'processing' ? 'bg-primary/10 border-primary/30' :
                        item.status === 'completed' ? 'bg-accent/20 border-accent/40' :
                        item.status === 'error' ? 'bg-destructive/10 border-destructive/30' :
                          'bg-card border-border'
                        }`}
                      >
                        <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {String(item.sceneNumber).padStart(2, '0')}
                            </Badge>
                            {item.status === 'completed' && <span className="text-green-500">✓</span>}
                          </div>
                          <p className="text-muted-foreground line-clamp-1 mt-0.5">{item.prompt}</p>
                          {item.errorMessage && (
                            <p className="text-destructive text-[10px] mt-0.5">{item.errorMessage}</p>
                          )}
                        </div>
                        {item.status === 'error' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleRetryItem(item)}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-auto mt-0 p-3 space-y-4">
          {/* General Settings */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Videos per task:</Label>
                <Select 
                  value={String(settings.videosPerTask)} 
                  onValueChange={(v) => setSettings(s => ({ ...s, videosPerTask: parseInt(v) }))}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Model (Optional):</Label>
                <Select 
                  value={settings.model} 
                  onValueChange={(v) => setSettings(s => ({ ...s, model: v }))}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veo-3.1-fast">Default (Veo 3.1 - Fast)</SelectItem>
                    <SelectItem value="veo-3">Veo 3</SelectItem>
                    <SelectItem value="imagen-3">Imagen 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Ratio (T2V & I2V Crop):</Label>
                <Select 
                  value={settings.ratio} 
                  onValueChange={(v) => setSettings(s => ({ ...s, ratio: v }))}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Start from (Prompt/Image):</Label>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    min={1} 
                    value={settings.startFrom}
                    onChange={(e) => setSettings(s => ({ ...s, startFrom: parseInt(e.target.value) || 1 }))}
                    className="w-16 h-8 text-xs text-center"
                  />
                  <span className="text-xs text-muted-foreground">#</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Video creation wait time (sec):</Label>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    min={10} 
                    value={settings.waitTimeMin}
                    onChange={(e) => setSettings(s => ({ ...s, waitTimeMin: parseInt(e.target.value) || 30 }))}
                    className="w-14 h-8 text-xs text-center"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input 
                    type="number" 
                    min={10} 
                    value={settings.waitTimeMax}
                    onChange={(e) => setSettings(s => ({ ...s, waitTimeMax: parseInt(e.target.value) || 60 }))}
                    className="w-14 h-8 text-xs text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Language:</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(v) => setSettings(s => ({ ...s, language: v }))}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Download Settings */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">Download Settings</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Auto-download videos:</Label>
                <Switch 
                  checked={settings.autoDownload}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, autoDownload: v }))}
                />
              </div>
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs h-auto p-0 text-primary"
              >
                Configure folder
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Tip: Turn off 'Ask where to save...' in your browser's download settings for seamless auto-downloading.
            </p>
          </div>

          {/* Character Management */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">Personagens Consistentes</h3>
            <div className="space-y-2">
              {characters.map(char => (
                <div key={char.id} className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  {char.imageUrl && (
                    <img src={char.imageUrl} alt={char.name} className="w-8 h-8 rounded-full object-cover" />
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
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => setShowCharacterForm(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Character
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-auto mt-0 p-3 space-y-3">
          {/* Detailed Log */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-2">Detailed Log</h3>
            <ScrollArea className="h-48 rounded border border-border bg-card/50 p-2">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No logs yet</p>
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
            <h3 className="text-sm font-medium text-destructive mb-2">
              Failed Tasks ({failedTasks.length})
            </h3>
            <ScrollArea className="h-24 rounded border border-border bg-card/50 p-2">
              {failedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No failed tasks</p>
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
              className="w-full h-9 mt-2 text-xs gap-1.5"
              onClick={copyFailedPrompts}
              disabled={failedTasks.length === 0}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Failed Prompts/Images
            </Button>
          </div>

          {/* Prompt History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-primary">Prompt History</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] text-destructive"
                onClick={() => {
                  clearPromptHistory();
                  setHistoryItems([]);
                  toast.success("History cleared");
                }}
                disabled={historyItems.length === 0}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            {historyItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No history yet</p>
            ) : (
              <div className="space-y-1.5">
                {historyItems.slice(0, 10).map(item => (
                  <div key={item.id} className="p-1.5 rounded border border-border bg-card text-xs">
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
        <TabsContent value="tools" className="flex-1 overflow-auto mt-0 p-3 space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-10 justify-start gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Export Queue as .txt
            </Button>
            <Button variant="outline" className="w-full h-10 justify-start gap-2 text-sm">
              <Download className="w-4 h-4" />
              Download All Videos
            </Button>
            <Button variant="outline" className="w-full h-10 justify-start gap-2 text-sm">
              <User className="w-4 h-4" />
              Import Character from JSON
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-primary mb-3">User Manual</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                Português
              </Button>
              <Button variant="default" size="sm" className="flex-1 text-xs">
                English
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}