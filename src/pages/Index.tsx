import { useState } from "react";
import { Character, ApiConfig } from "@/types/character";
import { Header } from "@/components/Header";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterForm } from "@/components/CharacterForm";
import { PromptEditor } from "@/components/PromptEditor";
import { ApiSettings } from "@/components/ApiSettings";
import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";

const defaultApiConfig: ApiConfig = {
  primaryApiKey: "",
  fallbackApiKey: "",
  model: "imagen-3",
  maxRetries: 3,
};

const mockCharacters: Character[] = [
  {
    id: "1",
    name: "Narrador Sombrio",
    description: "Um narrador misterioso com voz grave e presença enigmática",
    basePrompt: "A mysterious male narrator figure, dark hooded cloak, face partially hidden in shadows, glowing eyes, cinematic lighting, dark fantasy style, highly detailed, 8k resolution",
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
    basePrompt: "1940s noir detective, fedora hat, trench coat, cigarette smoke, black and white film grain effect, moody lighting, rain-soaked streets background, highly detailed, cinematic",
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

export default function Index() {
  const [characters, setCharacters] = useState<Character[]>(mockCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultApiConfig);

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

  const handleDeleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const openNewCharacterForm = () => {
    setEditingCharacter(undefined);
    setShowForm(true);
  };

  const openEditCharacterForm = (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  if (selectedCharacter) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onNewCharacter={openNewCharacterForm} 
          onOpenSettings={() => setShowSettings(true)} 
        />
        <main className="container mx-auto px-4 py-8">
          <PromptEditor 
            character={selectedCharacter} 
            onBack={() => setSelectedCharacter(null)} 
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Header 
        onNewCharacter={openNewCharacterForm} 
        onOpenSettings={() => setShowSettings(true)} 
      />

      <main className="container mx-auto px-4 py-8 relative">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-6 animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Comece Criando seu Primeiro Personagem</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie personagens consistentes para seus vídeos. Defina prompts base e gere variações mantendo a identidade visual.
            </p>
            <Button onClick={openNewCharacterForm} variant="glow" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Criar Personagem
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Seus Personagens</h2>
              <span className="text-sm text-muted-foreground">({characters.length})</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={openEditCharacterForm}
                  onDelete={handleDeleteCharacter}
                  onSelect={setSelectedCharacter}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {showForm && (
        <CharacterForm
          character={editingCharacter}
          onSave={handleSaveCharacter}
          onClose={() => setShowForm(false)}
        />
      )}

      {showSettings && (
        <ApiSettings
          config={apiConfig}
          onSave={setApiConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
