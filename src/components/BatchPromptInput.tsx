import { useState } from "react";
import { Character } from "@/types/character";
import { BatchSession, createBatchFromText, clearBatch } from "@/lib/batchQueue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  FileText, 
  Layers, 
  FolderOpen, 
  AlertCircle,
  Sparkles 
} from "lucide-react";
import { toast } from "sonner";

interface BatchPromptInputProps {
  character?: Character;
  onBack: () => void;
  onStartBatch: (session: BatchSession) => void;
}

export function BatchPromptInput({ character, onBack, onStartBatch }: BatchPromptInputProps) {
  const [batchText, setBatchText] = useState("");
  const [folderName, setFolderName] = useState("LaCasaDark_Scenes");

  const promptCount = batchText
    .split('\n')
    .filter(line => line.trim().length > 0).length;

  const handleCreateBatch = () => {
    if (promptCount === 0) {
      toast.error("Cole pelo menos um prompt");
      return;
    }

    const session = createBatchFromText(
      batchText,
      character?.id,
      character?.name
    );
    
    session.downloadFolder = folderName;
    
    toast.success(`Lote criado com ${promptCount} cenas!`);
    onStartBatch(session);
  };

  const handleClear = () => {
    setBatchText("");
    clearBatch();
    toast.info("Lote limpo");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Layers className="w-4 h-4 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-sm">Modo Lote</p>
          <p className="text-xs text-muted-foreground">
            {character ? character.name : 'Sem personagem'}
          </p>
        </div>
        {promptCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {promptCount} cenas
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Instructions */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-xs font-medium text-primary flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3" />
            Como usar o Modo Lote
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cole um prompt por linha</li>
            <li>• Cada linha = uma cena numerada</li>
            <li>• Vídeos serão baixados automaticamente</li>
            <li>• Nomeados como cena-01.mp4, cena-02.mp4...</li>
          </ul>
        </div>

        {/* Folder name */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            Nome da pasta de download
          </Label>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Nome do projeto"
            className="h-9 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Downloads/{folderName}/cena-XX.mp4
          </p>
        </div>

        {/* Batch textarea */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Prompts em lote (um por linha)
          </Label>
          <Textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder={`Exemplo:\nNarrador sombrio emerge das sombras, câmera em zoom lento\nClose-up no rosto enigmático, olhos brilhando na escuridão\nFigura caminhando por corredor abandonado, atmosfera tensa`}
            className="min-h-40 text-sm font-mono resize-none"
          />
        </div>

        {/* Preview */}
        {promptCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Preview das cenas:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {batchText.split('\n')
                .filter(line => line.trim().length > 0)
                .map((line, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-2 rounded bg-muted/30 border border-border/50"
                  >
                    <Badge variant="outline" className="text-xs shrink-0">
                      Cena {String(index + 1).padStart(2, '0')}
                    </Badge>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {line.trim()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              O download automático requer que você esteja na página do Google Flow. 
              A extensão irá monitorar quando cada vídeo estiver pronto.
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <Button 
          onClick={handleCreateBatch}
          disabled={promptCount === 0}
          variant="glow"
          className="w-full"
        >
          <Layers className="w-4 h-4 mr-2" />
          Iniciar Lote ({promptCount} cenas)
        </Button>
        
        {promptCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-muted-foreground"
            onClick={handleClear}
          >
            Limpar tudo
          </Button>
        )}
      </div>
    </div>
  );
}
