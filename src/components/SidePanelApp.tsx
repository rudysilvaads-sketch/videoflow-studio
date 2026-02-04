import { useState, useEffect } from "react";
import { Character, ApiConfig } from "@/types/character";
import { getPromptHistory } from "@/lib/promptHistory";
import { SidePanelCharacterList } from "@/components/SidePanelCharacterList";
import { SidePanelPromptEditor } from "@/components/SidePanelPromptEditor";
import { SidePanelCharacterForm } from "@/components/SidePanelCharacterForm";
import { PromptHistory } from "@/components/PromptHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Key, Shield, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = 'characterflow_data';

const defaultApiConfig: ApiConfig = {
  primaryApiKey: "",
  fallbackApiKey: "",
  model: "imagen-3",
  maxRetries: 3,
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
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultApiConfig);
  const [historyCount, setHistoryCount] = useState(0);
  const [promptToUse, setPromptToUse] = useState<string | null>(null);

  // Atualizar contagem do histórico
  useEffect(() => {
    const updateCount = () => {
      setHistoryCount(getPromptHistory().length);
    };
    updateCount();
    
    // Atualizar quando localStorage mudar
    const handleStorage = () => updateCount();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [showHistory]);

  const handleSaveCharacter = (data: Omit<Character, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      setCharacters(prev => prev.map(c => 
        c.id === data.id 
          ? { ...c, ...data, createdAt: c.createdAt }
          : c
      ));
    } else {
      const newCharacter: Character = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      setCharacters(prev => [newCharacter, ...prev]);
    }
  };

  const handleUseHistoryPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copiado! Pronto para usar no Flow.");
  };

  const handleHistoryUpdated = () => {
    setHistoryCount(getPromptHistory().length);
  };

  // Settings Panel inline
  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(false)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Key className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Configurações de API</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Key className="w-3 h-3" />
            API Key Principal
          </Label>
          <Input
            type="password"
            placeholder="sk-..."
            value={apiConfig.primaryApiKey}
            onChange={(e) => setApiConfig(prev => ({ ...prev, primaryApiKey: e.target.value }))}
            className="h-9 text-sm font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Shield className="w-3 h-3" />
            API Key Fallback
          </Label>
          <Input
            type="password"
            placeholder="sk-... (backup)"
            value={apiConfig.fallbackApiKey}
            onChange={(e) => setApiConfig(prev => ({ ...prev, fallbackApiKey: e.target.value }))}
            className="h-9 text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Usada se a principal falhar
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Modelo</Label>
            <Select 
              value={apiConfig.model} 
              onValueChange={(v) => setApiConfig(prev => ({ ...prev, model: v }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imagen-3">Imagen 3</SelectItem>
                <SelectItem value="veo-3">Veo 3</SelectItem>
                <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Retries</Label>
            <Select 
              value={String(apiConfig.maxRetries)} 
              onValueChange={(v) => setApiConfig(prev => ({ ...prev, maxRetries: parseInt(v) }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <Button variant="glow" className="w-full" onClick={() => setShowSettings(false)}>
          Salvar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {showSettings ? (
        <SettingsPanel />
      ) : showHistory ? (
        <PromptHistory
          onClose={() => {
            setShowHistory(false);
            handleHistoryUpdated();
          }}
          onUsePrompt={handleUseHistoryPrompt}
        />
      ) : showForm ? (
        <SidePanelCharacterForm
          onSave={handleSaveCharacter}
          onClose={() => setShowForm(false)}
        />
      ) : selectedCharacter ? (
        <SidePanelPromptEditor
          character={selectedCharacter}
          onBack={() => {
            setSelectedCharacter(null);
            handleHistoryUpdated();
          }}
          apiConfig={apiConfig}
        />
      ) : (
        <>
          <SidePanelCharacterList
            characters={characters}
            onSelect={setSelectedCharacter}
            onNew={() => setShowForm(true)}
            onOpenHistory={() => setShowHistory(true)}
            historyCount={historyCount}
          />
          
          <div className="p-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações de API
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
