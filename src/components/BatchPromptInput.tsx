import { useState } from "react";
import { Character } from "@/types/character";
import { PromptTemplate, promptTemplates, categoryLabels } from "@/data/promptTemplates";
import { BatchSession, createBatchFromText, clearBatch } from "@/lib/batchQueue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  FileText, 
  Layers, 
  FolderOpen, 
  AlertCircle,
  Sparkles,
  User,
  Bookmark,
  X,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface BatchPromptInputProps {
  characters: Character[];
  onBack: () => void;
  onStartBatch: (session: BatchSession) => void;
}

export function BatchPromptInput({ characters, onBack, onStartBatch }: BatchPromptInputProps) {
  const [batchText, setBatchText] = useState("");
  const [folderName, setFolderName] = useState("LaCasaDark_Scenes");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const promptLines = batchText
    .split('\n')
    .filter(line => line.trim().length > 0);
  
  const promptCount = promptLines.length;

  const generatePreviewPrompt = (line: string, index: number) => {
    let fullPrompt = '';
    
    if (selectedCharacter?.basePrompt) {
      fullPrompt += selectedCharacter.basePrompt;
    }
    
    if (selectedTemplate?.prompt) {
      fullPrompt += fullPrompt ? '\n\n' : '';
      fullPrompt += `[TEMPLATE: ${selectedTemplate.name}]\n${selectedTemplate.prompt}`;
    }
    
    fullPrompt += fullPrompt ? '\n\n' : '';
    fullPrompt += `[SCENE ${index + 1}]: ${line.trim()}`;
    
    return fullPrompt;
  };

  const handleCreateBatch = () => {
    if (promptCount === 0) {
      toast.error("Cole pelo menos um prompt");
      return;
    }

    const session = createBatchFromText(batchText, {
      characterId: selectedCharacter?.id,
      characterName: selectedCharacter?.name,
      characterBasePrompt: selectedCharacter?.basePrompt,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      templatePrompt: selectedTemplate?.prompt,
    });
    
    session.downloadFolder = folderName;
    
    const parts = [];
    if (selectedCharacter) parts.push(selectedCharacter.name);
    if (selectedTemplate) parts.push(selectedTemplate.name);
    
    toast.success(`Lote criado com ${promptCount} cenas!${parts.length ? ` (${parts.join(' + ')})` : ''}`);
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
            Personagem + Template + Cenas
          </p>
        </div>
        {promptCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {promptCount} cenas
          </Badge>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Instructions */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs font-medium text-primary flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3" />
              Como usar o Modo Lote
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Selecione um personagem (opcional)</li>
              <li>• Escolha um template de cena (opcional)</li>
              <li>• Cole descrições de cenas (um por linha)</li>
              <li>• Tudo será combinado automaticamente!</li>
            </ul>
          </div>

          {/* Character Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <User className="w-3 h-3" />
              Personagem base
            </Label>
            <Select 
              value={selectedCharacter?.id || "none"} 
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedCharacter(null);
                } else {
                  const char = characters.find(c => c.id === value);
                  setSelectedCharacter(char || null);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione um personagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum personagem</SelectItem>
                {characters.map(char => (
                  <SelectItem key={char.id} value={char.id}>
                    <div className="flex items-center gap-2">
                      {char.imageUrl && (
                        <img 
                          src={char.imageUrl} 
                          alt={char.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      {char.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCharacter && (
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                <img 
                  src={selectedCharacter.imageUrl} 
                  alt={selectedCharacter.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{selectedCharacter.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedCharacter.attributes.style}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setSelectedCharacter(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              Template de cena
            </Label>
            <Select 
              value={selectedTemplate?.id || "none"} 
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedTemplate(null);
                } else {
                  const template = promptTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum template</SelectItem>
                {Object.entries(categoryLabels).map(([category, label]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {label}
                    </div>
                    {promptTemplates
                      .filter(t => t.category === category)
                      .map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <div className="p-2 rounded bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {categoryLabels[selectedTemplate.category]}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs font-medium">{selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {selectedTemplate.description}
                </p>
              </div>
            )}
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
              Descrições das cenas (um por linha)
            </Label>
            <Textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`Exemplo:\nEmerge das sombras, câmera em zoom lento\nClose-up no rosto, olhos brilhando\nCaminhando por corredor abandonado`}
              className="min-h-32 text-sm font-mono resize-none"
            />
          </div>

          {/* Combined indicator */}
          {(selectedCharacter || selectedTemplate) && promptCount > 0 && (
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-xs font-medium text-primary mb-1">
                🔗 Combinação automática ativa
              </p>
              <p className="text-xs text-muted-foreground">
                Cada cena terá:
                {selectedCharacter && <span className="block">• Base: {selectedCharacter.name}</span>}
                {selectedTemplate && <span className="block">• Template: {selectedTemplate.name}</span>}
                <span className="block">• Sua descrição da cena</span>
              </p>
            </div>
          )}

          {/* Preview */}
          {promptCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Preview das cenas:</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {showPreview ? 'Ver resumo' : 'Ver prompt completo'}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {promptLines.map((line, index) => (
                  <div 
                    key={index}
                    className="p-2 rounded bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        Cena {String(index + 1).padStart(2, '0')}
                      </Badge>
                      {selectedCharacter && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedCharacter.name}
                        </Badge>
                      )}
                      {selectedTemplate && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedTemplate.name}
                        </Badge>
                      )}
                    </div>
                    {showPreview ? (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-24 overflow-y-auto">
                        {generatePreviewPrompt(line, index)}
                      </pre>
                    ) : (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {line.trim()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                O download automático requer que você esteja na página do Google Flow. 
                A extensão irá monitorar quando cada vídeo estiver pronto.
              </span>
            </p>
          </div>
        </div>
      </ScrollArea>

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
