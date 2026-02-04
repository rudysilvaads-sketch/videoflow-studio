import { useState } from "react";
import { Character, Prompt } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2, CheckCircle, XCircle, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PromptEditorProps {
  character: Character;
  onBack: () => void;
}

export function PromptEditor({ character, onBack }: PromptEditorProps) {
  const [promptText, setPromptText] = useState("");
  const [promptType, setPromptType] = useState<'scene' | 'action' | 'dialogue'>('scene');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const generatePrompt = async () => {
    if (!promptText.trim()) {
      toast.error("Digite um prompt primeiro");
      return;
    }

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      characterId: character.id,
      content: promptText,
      type: promptType,
      status: 'processing',
      createdAt: new Date(),
    };

    setPrompts(prev => [newPrompt, ...prev]);
    setIsGenerating(true);

    // Simular geração com o personagem
    setTimeout(() => {
      const fullPrompt = `${character.basePrompt}\n\n[${promptType.toUpperCase()}]: ${promptText}`;
      
      setPrompts(prev => prev.map(p => 
        p.id === newPrompt.id 
          ? { ...p, status: 'completed', result: fullPrompt }
          : p
      ));
      setIsGenerating(false);
      setPromptText("");
      toast.success("Prompt gerado com sucesso!");
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const getStatusIcon = (status: Prompt['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          ← Voltar
        </Button>
        <div className="flex items-center gap-3">
          {character.imageUrl && (
            <img 
              src={character.imageUrl} 
              alt={character.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{character.name}</h2>
            <p className="text-sm text-muted-foreground">Editor de Prompts</p>
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Novo Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={promptType} onValueChange={(v) => setPromptType(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scene">Cena</SelectItem>
                <SelectItem value="action">Ação</SelectItem>
                <SelectItem value="dialogue">Diálogo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Descreva a cena, ação ou diálogo que você quer gerar..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="min-h-32 bg-muted border-border resize-none"
          />

          <div className="flex justify-end">
            <Button 
              onClick={generatePrompt} 
              disabled={isGenerating || !promptText.trim()}
              variant="glow"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Prompts</h3>
        
        {prompts.length === 0 ? (
          <Card className="bg-card/50 border-border border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum prompt gerado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <Card key={prompt.id} className="bg-card border-border animate-scale-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(prompt.status)}
                        <Badge variant="secondary">{prompt.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {prompt.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{prompt.content}</p>
                      
                      {prompt.result && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground/90">
                            {prompt.result}
                          </pre>
                        </div>
                      )}
                      
                      {prompt.errorMessage && (
                        <p className="text-sm text-destructive">{prompt.errorMessage}</p>
                      )}
                    </div>

                    {prompt.result && (
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => copyToClipboard(prompt.result!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
