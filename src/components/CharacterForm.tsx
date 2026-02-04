import { useState } from "react";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

interface CharacterFormProps {
  character?: Character;
  onSave: (character: Omit<Character, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export function CharacterForm({ character, onSave, onClose }: CharacterFormProps) {
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border animate-scale-in max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {character ? "Editar Personagem" : "Novo Personagem"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Personagem</Label>
                <Input
                  id="name"
                  placeholder="Ex: Narrador Misterioso"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-muted border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="style">Estilo Visual</Label>
                <Input
                  id="style"
                  placeholder="Ex: Anime, Realista, Cartoon"
                  value={formData.attributes.style}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    attributes: { ...prev.attributes, style: e.target.value }
                  }))}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva seu personagem..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-muted border-border min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrompt">Prompt Base (Consistência)</Label>
              <Textarea
                id="basePrompt"
                placeholder="Prompt detalhado para manter consistência visual do personagem em todas as gerações..."
                value={formData.basePrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrompt: e.target.value }))}
                className="bg-muted border-border min-h-32 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Este prompt será usado como base para todas as gerações deste personagem
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  placeholder="Ex: 30 anos, Jovem adulto"
                  value={formData.attributes.age}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    attributes: { ...prev.attributes, age: e.target.value }
                  }))}
                  className="bg-muted border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Input
                  id="gender"
                  placeholder="Ex: Masculino, Feminino"
                  value={formData.attributes.gender}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    attributes: { ...prev.attributes, gender: e.target.value }
                  }))}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem de Referência</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="bg-muted border-border"
                />
                <Button type="button" variant="secondary" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="glow">
                {character ? "Salvar Alterações" : "Criar Personagem"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
