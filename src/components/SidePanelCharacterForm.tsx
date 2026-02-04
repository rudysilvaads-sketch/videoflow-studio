import { useState } from "react";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

interface SidePanelCharacterFormProps {
  character?: Character;
  onSave: (character: Omit<Character, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export function SidePanelCharacterForm({ character, onSave, onClose }: SidePanelCharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    description: character?.description || "",
    basePrompt: character?.basePrompt || "",
    imageUrl: character?.imageUrl || "",
    attributes: {
      age: character?.attributes.age || "",
      gender: character?.attributes.gender || "",
      style: character?.attributes.style || "",
      features: character?.attributes.features || [],
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.basePrompt.trim()) {
      toast.error("Nome e prompt base são obrigatórios");
      return;
    }

    onSave({
      ...formData,
      id: character?.id,
    });
    
    toast.success(character ? "Personagem atualizado!" : "Personagem criado!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">
            {character ? "Editar" : "Novo"} Personagem
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs">Nome</Label>
          <Input
            id="name"
            placeholder="Ex: Narrador Misterioso"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="style" className="text-xs">Estilo Visual</Label>
          <Input
            id="style"
            placeholder="Ex: Anime, Realista, Cartoon"
            value={formData.attributes.style}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              attributes: { ...prev.attributes, style: e.target.value }
            }))}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva seu personagem..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-16 text-sm resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="basePrompt" className="text-xs">Prompt Base (Consistência)</Label>
          <Textarea
            id="basePrompt"
            placeholder="Prompt detalhado para manter consistência visual..."
            value={formData.basePrompt}
            onChange={(e) => setFormData(prev => ({ ...prev, basePrompt: e.target.value }))}
            className="min-h-24 text-sm font-mono resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Este prompt será usado em todas as gerações
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-xs">Idade</Label>
            <Input
              id="age"
              placeholder="Ex: 30 anos"
              value={formData.attributes.age}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                attributes: { ...prev.attributes, age: e.target.value }
              }))}
              className="h-9 text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs">Gênero</Label>
            <Input
              id="gender"
              placeholder="Ex: Masculino"
              value={formData.attributes.gender}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                attributes: { ...prev.attributes, gender: e.target.value }
              }))}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl" className="text-xs">URL da Imagem</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="h-9 text-sm"
            />
            <Button type="button" variant="secondary" size="icon" className="h-9 w-9 shrink-0">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="p-3 border-t border-border flex gap-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="glow" className="flex-1" onClick={handleSubmit}>
          {character ? "Salvar" : "Criar"}
        </Button>
      </div>
    </div>
  );
}
