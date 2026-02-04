import { useState, useEffect } from "react";
import { PromptHistoryItem, getPromptHistory, toggleFavorite, deleteHistoryItem, clearHistory } from "@/lib/promptHistory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Clock, Star, Trash2, Copy, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PromptHistoryProps {
  onClose: () => void;
  onUsePrompt: (prompt: string) => void;
}

export function PromptHistory({ onClose, onUsePrompt }: PromptHistoryProps) {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getPromptHistory());
  }, []);

  const filteredHistory = filter === 'favorites' 
    ? history.filter(item => item.isFavorite)
    : history;

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setHistory(getPromptHistory());
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getPromptHistory());
    toast.success("Prompt removido");
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory(getPromptHistory());
    setShowClearConfirm(false);
    toast.success("Histórico limpo (favoritos mantidos)");
  };

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Copiado!");
  };

  const handleUse = (prompt: string) => {
    onUsePrompt(prompt);
    onClose();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeEmoji = (type: PromptHistoryItem['promptType']) => {
    switch (type) {
      case 'scene': return '🎬';
      case 'action': return '⚡';
      case 'dialogue': return '💬';
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Clock className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm flex-1">Histórico</span>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-3 border-b border-border">
        <Badge
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          Todos ({history.length})
        </Badge>
        <Badge
          variant={filter === 'favorites' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('favorites')}
        >
          <Star className="w-3 h-3 mr-1" />
          Favoritos ({history.filter(h => h.isFavorite).length})
        </Badge>
      </div>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs flex-1">Limpar histórico? (favoritos serão mantidos)</p>
          <Button size="sm" variant="ghost" className="h-7" onClick={() => setShowClearConfirm(false)}>
            Cancelar
          </Button>
          <Button size="sm" variant="destructive" className="h-7" onClick={handleClearAll}>
            Limpar
          </Button>
        </div>
      )}

      {/* History list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {filter === 'favorites' ? 'Nenhum favorito ainda' : 'Histórico vazio'}
              </p>
              <p className="text-xs mt-1">
                {filter === 'favorites' 
                  ? 'Marque prompts com ⭐ para salvar' 
                  : 'Seus prompts gerados aparecerão aqui'}
              </p>
            </div>
          ) : (
            filteredHistory.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-card border border-border space-y-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs">{getTypeEmoji(item.promptType)}</span>
                      <span className="font-medium text-sm truncate">{item.characterName}</span>
                      {item.templateName && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {item.templateName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 shrink-0 ${item.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    onClick={() => handleToggleFavorite(item.id)}
                  >
                    <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* User prompt */}
                <p className="text-sm text-foreground/90 line-clamp-2">
                  {item.userPrompt || "(Apenas template)"}
                </p>

                {/* Actions */}
                <div className="flex gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 text-xs"
                    onClick={() => handleCopy(item.fullPrompt)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="glow"
                    className="h-7 flex-1 text-xs"
                    onClick={() => handleUse(item.fullPrompt)}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Usar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-card/50">
        <p className="text-xs text-muted-foreground text-center">
          {filteredHistory.length} de {history.length} prompts
        </p>
      </div>
    </div>
  );
}
