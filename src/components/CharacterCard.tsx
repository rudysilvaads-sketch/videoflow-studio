import { Character } from "@/types/character";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Sparkles } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  onSelect: (character: Character) => void;
}

export function CharacterCard({ character, onEdit, onDelete, onSelect }: CharacterCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
      
      <div 
        className="h-48 bg-muted relative overflow-hidden"
        onClick={() => onSelect(character)}
      >
        {character.imageUrl ? (
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(character);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(character.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="relative z-20 p-4 -mt-8">
        <h3 className="font-semibold text-lg text-foreground mb-1">{character.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{character.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {character.attributes.style && (
            <Badge variant="secondary" className="text-xs">
              {character.attributes.style}
            </Badge>
          )}
          {character.attributes.age && (
            <Badge variant="outline" className="text-xs">
              {character.attributes.age}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
