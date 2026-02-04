import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface SidePanelCharacterListProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  onNew: () => void;
}

export function SidePanelCharacterList({ characters, onSelect, onNew }: SidePanelCharacterListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">CharacterFlow</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onNew}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista de personagens */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Sparkles className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum personagem ainda
            </p>
            <Button size="sm" variant="glow" onClick={onNew}>
              <Plus className="w-4 h-4 mr-1" />
              Criar Personagem
            </Button>
          </div>
        ) : (
          characters.map((character) => (
            <button
              key={character.id}
              onClick={() => onSelect(character)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-card hover:bg-primary/10 border border-border hover:border-primary/50 transition-all text-left group"
            >
              {character.imageUrl ? (
                <img 
                  src={character.imageUrl} 
                  alt={character.name}
                  className="w-10 h-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{character.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {character.attributes.style || character.description.slice(0, 30)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
