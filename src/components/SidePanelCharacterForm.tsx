import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { X, Sparkles, Upload, ChevronDown, Search, Check } from "lucide-react";
import { toast } from "sonner";
 import { visualStyles, styleCategories, getStylesByCategory } from "@/data/visualStyles";

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
   
   const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
   const [styleSearch, setStyleSearch] = useState("");
 
   const filteredStyles = visualStyles.filter(s => 
     s.label.toLowerCase().includes(styleSearch.toLowerCase()) ||
     s.category.toLowerCase().includes(styleSearch.toLowerCase())
   );
 
   const selectedStyle = visualStyles.find(s => s.value === formData.attributes.style || s.label === formData.attributes.style);

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
          <div className="relative">
            <button
              type="button"
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              className="w-full h-9 px-3 text-sm text-left bg-background border border-input rounded-md flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <span className={selectedStyle ? "text-foreground" : "text-muted-foreground"}>
                {selectedStyle?.label || formData.attributes.style || "Selecione um estilo..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${styleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {styleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                >
                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar estilo..."
                        value={styleSearch}
                        onChange={(e) => setStyleSearch(e.target.value)}
                        className="h-8 text-xs pl-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* Styles List */}
                  <ScrollArea className="h-64">
                    <div className="p-1">
                      {styleSearch ? (
                        // Flat search results
                        filteredStyles.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">Nenhum estilo encontrado</p>
                        ) : (
                          <div className="space-y-0.5">
                            {filteredStyles.map((style) => (
                              <button
                                key={style.value}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    attributes: { ...prev.attributes, style: style.label }
                                  }));
                                  setStyleDropdownOpen(false);
                                  setStyleSearch("");
                                }}
                                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center justify-between hover:bg-accent transition-colors ${
                                  formData.attributes.style === style.label ? 'bg-primary/20 text-primary' : ''
                                }`}
                              >
                                <span>{style.label}</span>
                                <span className="text-[10px] text-muted-foreground">{style.category}</span>
                              </button>
                            ))}
                          </div>
                        )
                      ) : (
                        // Grouped by category
                        styleCategories.map((category) => (
                          <div key={category} className="mb-2">
                            <p className="px-2 py-1 text-[10px] font-semibold text-primary uppercase tracking-wider">{category}</p>
                            <div className="space-y-0.5">
                              {getStylesByCategory(category).map((style) => (
                                <button
                                  key={style.value}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      attributes: { ...prev.attributes, style: style.label }
                                    }));
                                    setStyleDropdownOpen(false);
                                    setStyleSearch("");
                                  }}
                                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center justify-between hover:bg-accent transition-colors ${
                                    formData.attributes.style === style.label ? 'bg-primary/20 text-primary' : ''
                                  }`}
                                >
                                  <span>{style.label}</span>
                                  {formData.attributes.style === style.label && (
                                    <Check className="w-3 h-3 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Footer with count */}
                  <div className="p-2 border-t border-border bg-muted/30">
                    <p className="text-[10px] text-muted-foreground text-center">
                      {visualStyles.length} estilos disponíveis
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
