import { useState, useEffect, useCallback } from "react";
import { 
  BatchSession, 
  BatchPromptItem,
  saveBatch,
  updateBatchItem,
  getNextPendingItem,
  getBatchProgress,
  clearBatch 
} from "@/lib/batchQueue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Loader2, 
  AlertCircle,
  Download,
  Send,
  Trash2,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";

interface BatchQueueManagerProps {
  session: BatchSession;
  onBack: () => void;
  onSessionUpdate: (session: BatchSession) => void;
}

export function BatchQueueManager({ session, onBack, onSessionUpdate }: BatchQueueManagerProps) {
  const [isRunning, setIsRunning] = useState(session.isRunning);
  const [currentSession, setCurrentSession] = useState(session);

  const progress = getBatchProgress(currentSession);

  const updateSession = useCallback((updates: Partial<BatchSession>) => {
    const updated = { ...currentSession, ...updates };
    setCurrentSession(updated);
    saveBatch(updated);
    onSessionUpdate(updated);
  }, [currentSession, onSessionUpdate]);

  const updateItem = useCallback((itemId: string, updates: Partial<BatchPromptItem>) => {
    const updated = updateBatchItem(currentSession, itemId, updates);
    setCurrentSession(updated);
    onSessionUpdate(updated);
    return updated;
  }, [currentSession, onSessionUpdate]);

  // Send prompt to Flow via Chrome extension
  const sendPromptToFlow = useCallback((prompt: string, sceneNumber: number) => {
    // @ts-ignore - chrome is defined only in extension context
    if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      // @ts-ignore
      window.chrome.runtime.sendMessage({
        type: 'INJECT_BATCH_PROMPT',
        prompt,
        folderName: currentSession.downloadFolder,
        sceneNumber,
      }, (response: { success: boolean; error?: string }) => {
        if (response?.success) {
          console.log('[BatchQueue] Prompt enviado ao Flow');
        } else {
          console.error('[BatchQueue] Erro ao enviar:', response?.error);
        }
      });
      return true;
    }
    return false;
  }, [currentSession.downloadFolder]);

  // Process next item in queue
  const processNextItem = useCallback(() => {
    const nextItem = getNextPendingItem(currentSession);
    
    if (!nextItem) {
      setIsRunning(false);
      updateSession({ isRunning: false });
      toast.success("🎉 Lote concluído! Todos os prompts foram processados.");
      return;
    }

    // Update item status to sending
    updateItem(nextItem.id, { status: 'sending' });

    // Send to Flow via content script
    const sent = sendPromptToFlow(nextItem.prompt, nextItem.sceneNumber);
    
    if (sent) {
      updateItem(nextItem.id, { status: 'processing' });
      toast.info(`🚀 Cena ${nextItem.sceneNumber} enviada ao Google Flow`);
    } else {
      // Fallback: copy to clipboard if not in extension context
      navigator.clipboard.writeText(nextItem.prompt);
      updateItem(nextItem.id, { status: 'processing' });
      toast.warning(`📋 Cena ${nextItem.sceneNumber} copiada! Cole no Flow manualmente.`);
    }
  }, [currentSession, updateItem, sendPromptToFlow, updateSession]);

  // Listen for video completion messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'VIDEO_COMPLETED') {
        const { videoUrl, sceneNumber } = event.data;
        
        // Find processing item
        const processingItem = currentSession.items.find(
          item => item.status === 'processing'
        );
        
        if (processingItem) {
          updateItem(processingItem.id, { 
            status: 'completed',
            videoUrl,
            downloadedAt: new Date(),
          });
          
          toast.success(`Cena ${processingItem.sceneNumber} concluída e baixada!`);
          
          // Process next if still running
          if (isRunning) {
            setTimeout(processNextItem, 1000);
          }
        }
      }
      
      if (event.data.type === 'VIDEO_ERROR') {
        const processingItem = currentSession.items.find(
          item => item.status === 'processing'
        );
        
        if (processingItem) {
          updateItem(processingItem.id, { 
            status: 'error',
            errorMessage: event.data.error || 'Erro ao processar vídeo',
          });
          
          toast.error(`Erro na cena ${processingItem.sceneNumber}`);
          
          // Continue with next if running
          if (isRunning) {
            setTimeout(processNextItem, 2000);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentSession, isRunning, updateItem, processNextItem]);

  const handleStart = () => {
    setIsRunning(true);
    updateSession({ isRunning: true });
    processNextItem();
    toast.success("Lote iniciado!");
  };

  const handlePause = () => {
    setIsRunning(false);
    updateSession({ isRunning: false });
    toast.info("Lote pausado");
  };

  const handleReset = () => {
    const resetItems = currentSession.items.map(item => ({
      ...item,
      status: 'pending' as const,
      videoUrl: undefined,
      downloadedAt: undefined,
      errorMessage: undefined,
    }));
    
    updateSession({ 
      items: resetItems, 
      currentIndex: 0,
      isRunning: false,
    });
    setIsRunning(false);
    toast.info("Lote reiniciado");
  };

  const handleClearBatch = () => {
    clearBatch();
    onBack();
    toast.success("Lote removido");
  };

  const handleRetryItem = (item: BatchPromptItem) => {
    updateItem(item.id, { status: 'pending', errorMessage: undefined });
    if (!isRunning) {
      processNextItem();
    }
  };

  const getStatusIcon = (status: BatchPromptItem['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />;
      case 'sending':
        return <Send className="w-3 h-3 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case 'completed':
        return <Check className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

  const getStatusBadge = (status: BatchPromptItem['status']) => {
    const variants: Record<string, string> = {
      pending: 'secondary',
      sending: 'default',
      processing: 'default',
      completed: 'default',
      error: 'destructive',
    };
    
    const labels: Record<string, string> = {
      pending: 'Aguardando',
      sending: 'Enviando',
      processing: 'Gerando...',
      completed: 'Concluído',
      error: 'Erro',
    };
    
    return (
      <Badge variant={variants[status] as "secondary" | "default" | "destructive"} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <p className="font-medium text-sm">Processando Lote</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            {currentSession.downloadFolder}
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
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{progress.completed}/{progress.total} cenas</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          {progress.percentage}% concluído
        </p>
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
            {progress.completed > 0 ? 'Continuar' : 'Iniciar'}
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
          onClick={handleClearBatch} 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={isRunning}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Queue list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {currentSession.items.map((item) => (
            <div 
              key={item.id}
              className={`p-2.5 rounded-lg border transition-colors ${
                item.status === 'processing' 
                  ? 'bg-primary/10 border-primary/30' 
                  : item.status === 'completed'
                  ? 'bg-green-500/10 border-green-500/30'
                  : item.status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Cena {String(item.sceneNumber).padStart(2, '0')}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.prompt}
                  </p>
                  
                  {item.errorMessage && (
                    <p className="text-xs text-red-500 mt-1">
                      {item.errorMessage}
                    </p>
                  )}
                  
                  {item.status === 'completed' && item.videoUrl && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Baixado como cena-{String(item.sceneNumber).padStart(2, '0')}.mp4
                    </p>
                  )}
                </div>

                {item.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRetryItem(item)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
