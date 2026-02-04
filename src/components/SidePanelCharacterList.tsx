import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock } from "lucide-react";
import logo from "@/assets/logo-lacasadark.png";

interface SidePanelCharacterListProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  onNew: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function SidePanelCharacterList({ characters, onSelect, onNew, onOpenHistory, historyCount }: SidePanelCharacterListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header com logo */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="La Casa Dark" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <span className="font-bold text-sm block leading-tight">La Casa Dark</span>
            <span className="text-xs text-primary font-medium">CORE</span>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onNew}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Botão de histórico */}
      <div className="p-2 border-b border-border">
        <Button 
          variant="outline" 
          className="w-full justify-start h-9 text-sm"
          onClick={onOpenHistory}
        >
          <Clock className="w-4 h-4 mr-2 text-primary" />
          <span className="flex-1 text-left">Histórico de Prompts</span>
          {historyCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {historyCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Lista de personagens */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <p className="text-xs text-muted-foreground px-1 mb-1">Personagens</p>
        
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
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
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                  👤
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
