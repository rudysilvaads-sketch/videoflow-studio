import { Button } from "@/components/ui/button";
import { Settings, Plus, Sparkles } from "lucide-react";

interface HeaderProps {
  onNewCharacter: () => void;
  onOpenSettings: () => void;
}

export function Header({ onNewCharacter, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">CharacterFlow</h1>
              <p className="text-xs text-muted-foreground">Personagens Consistentes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onOpenSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button onClick={onNewCharacter} variant="glow">
              <Plus className="w-4 h-4 mr-2" />
              Novo Personagem
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
