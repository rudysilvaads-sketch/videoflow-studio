import { useState } from "react";
import { Character, ApiConfig } from "@/types/character";
import { PromptTemplate } from "@/data/promptTemplates";
import { savePromptToHistory } from "@/lib/promptHistory";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2, Copy, Send, Lightbulb, ChevronLeft, Sparkles, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface SidePanelPromptEditorProps {
  character: Character;
  onBack: () => void;
  apiConfig: ApiConfig;
}

const quickSuggestions = [
  "Caminhando na escuridão",
  "Close-up dramático",
  "Olhar misterioso",
];

export function SidePanelPromptEditor({ character, onBack, apiConfig }: SidePanelPromptEditorProps) {
  const [promptText, setPromptText] = useState("");
  const [promptType, setPromptType] = useState<'scene' | 'action' | 'dialogue'>('scene');
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string | null>(null);
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

  const generateFullPrompt = () => {
    const templatePart = selectedTemplate ? `\n[TEMPLATE: ${selectedTemplate.name}]\n${selectedTemplate.prompt}` : '';
    return `${character.basePrompt}${templatePart}\n\n[${promptType.toUpperCase()}]: ${promptText}`;
  };

  const saveToHistory = (fullPrompt: string) => {
    savePromptToHistory({
      characterId: character.id,
      characterName: character.name,
      templateName: selectedTemplate?.name,
      promptType,
      userPrompt: promptText || selectedTemplate?.description || '',
      fullPrompt,
    });
  };

  const handleGenerate = async () => {
    if (!promptText.trim() && !selectedTemplate) {
      toast.error("Digite um prompt ou selecione um template");
      return;
    }

    setIsGenerating(true);
    setRetryCount(0);
    
    const fullPrompt = generateFullPrompt();
    
    // Simular geração com possível erro para demonstrar retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso ou erro aleatório para demonstrar o fallback
    const hasError = Math.random() < 0.2; // 20% chance de erro
    
    if (hasError && retryCount < apiConfig.maxRetries) {
      setRetryCount(prev => prev + 1);
      toast.warning(`Tentativa ${retryCount + 1}/${apiConfig.maxRetries} falhou. Tentando variação...`);
      
      // Gerar sugestões alternativas baseadas no contexto
      const baseText = promptText || selectedTemplate?.prompt || '';
      setAlternativeSuggestions([
        `${baseText}, cinematic lighting, 8k quality, ultra detailed`,
        `${baseText}, dramatic atmosphere, film grain, professional`,
        `${baseText}, high quality render, masterpiece, award winning`,
      ]);
      
      // Auto-retry com variação
      setTimeout(() => {
        setLastGeneratedPrompt(fullPrompt);
        saveToHistory(fullPrompt);
        setIsGenerating(false);
        toast.success("Prompt gerado com sucesso na segunda tentativa!");
      }, 1500);
    } else {
      setLastGeneratedPrompt(fullPrompt);
      saveToHistory(fullPrompt);
      setIsGenerating(false);
      setAlternativeSuggestions([]);
      toast.success("Prompt gerado com sucesso!");
    }
  };

  const copyToClipboard = () => {
    if (lastGeneratedPrompt) {
      navigator.clipboard.writeText(lastGeneratedPrompt);
      toast.success("Copiado!");
    }
  };

  const sendToFlow = () => {
    if (lastGeneratedPrompt) {
      // @ts-ignore - chrome é definido apenas na extensão
      if (typeof window !== 'undefined' && window.chrome?.runtime) {
        // @ts-ignore
        window.chrome.runtime.sendMessage({
          type: 'COPY_TO_FLOW',
          prompt: lastGeneratedPrompt
        });
        toast.success("Enviado para o Flow!");
      } else {
        // Fallback para quando não está na extensão
        copyToClipboard();
        toast.info("Prompt copiado! Cole no Flow manualmente.");
      }
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setPromptText(template.description);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" selecionado!`);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
  };

  if (showTemplates) {
    return (
      <TemplateLibrary 
        onSelect={handleSelectTemplate}
        onClose={() => setShowTemplates(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header compacto */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {character.imageUrl && (
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/50"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{character.name}</p>
          <p className="text-xs text-muted-foreground truncate">{character.attributes.style}</p>
        </div>
      </div>

      {/* Área de scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Botão de Templates */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 h-10"
          onClick={() => setShowTemplates(true)}
        >
          <Bookmark className="w-4 h-4 text-primary" />
          <span className="flex-1 text-left">Templates Dark</span>
          <Badge variant="secondary" className="text-xs">18</Badge>
        </Button>

        {/* Template selecionado */}
        {selectedTemplate && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                {selectedTemplate.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={clearTemplate}
              >
                Remover
              </Button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {selectedTemplate.prompt}
            </p>
          </div>
        )}

        {/* Tipo de prompt */}
        <Select value={promptType} onValueChange={(v) => setPromptType(v as 'scene' | 'action' | 'dialogue')}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scene">🎬 Cena</SelectItem>
            <SelectItem value="action">⚡ Ação</SelectItem>
            <SelectItem value="dialogue">💬 Diálogo</SelectItem>
          </SelectContent>
        </Select>

        {/* Textarea do prompt */}
        <Textarea
          placeholder="Descreva detalhes adicionais para a cena..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="min-h-20 text-sm resize-none"
        />

        {/* Sugestões rápidas */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Sugestões rápidas
          </p>
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.map((suggestion, i) => (
              <Badge 
                key={i}
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setPromptText(prev => prev ? `${prev}, ${suggestion.toLowerCase()}` : suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Botão gerar */}
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || (!promptText.trim() && !selectedTemplate)}
          variant="glow"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {retryCount > 0 ? `Retry ${retryCount}...` : 'Gerando...'}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Gerar Prompt
            </>
          )}
        </Button>

        {/* Sugestões alternativas (quando há erro) */}
        {alternativeSuggestions.length > 0 && (
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-2">
            <p className="text-xs font-medium flex items-center gap-1 text-primary">
              <Sparkles className="w-3 h-3" />
              Prompts alternativos:
            </p>
            {alternativeSuggestions.map((alt, i) => (
              <button
                key={i}
                onClick={() => {
                  setPromptText(alt);
                  setAlternativeSuggestions([]);
                }}
                className="w-full text-left text-xs p-2 rounded bg-card hover:bg-primary/10 transition-colors border border-border/50 line-clamp-2"
              >
                {alt}
              </button>
            ))}
          </div>
        )}

        {/* Resultado */}
        {lastGeneratedPrompt && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Prompt gerado:</p>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
              <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/90 max-h-28 overflow-y-auto">
                {lastGeneratedPrompt}
              </pre>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1"
                onClick={copyToClipboard}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <Button 
                size="sm" 
                variant="glow" 
                className="flex-1"
                onClick={sendToFlow}
              >
                <Send className="w-3 h-3 mr-1" />
                Enviar ao Flow
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
