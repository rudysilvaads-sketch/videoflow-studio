 import { useState, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { X, Sparkles, Upload, ChevronDown, Search, Check, Image, Users } from "lucide-react";
import { toast } from "sonner";
 import { visualStyles, styleCategories, getStylesByCategory } from "@/data/visualStyles";
 import { characterTemplates } from "@/data/characterTemplates";

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
 
   const [isDragging, setIsDragging] = useState(false);
   const [imagePreview, setImagePreview] = useState<string | null>(character?.imageUrl || null);
   const [showTemplates, setShowTemplates] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const filteredStyles = visualStyles.filter(s => 
     s.label.toLowerCase().includes(styleSearch.toLowerCase()) ||
     s.category.toLowerCase().includes(styleSearch.toLowerCase())
   );
 
   // Parse selected styles from comma-separated string
   const selectedStyles = formData.attributes.style
     ? formData.attributes.style.split(', ').filter(Boolean)
     : [];
 
   const toggleStyle = (styleLabel: string) => {
     const isSelected = selectedStyles.includes(styleLabel);
     let newStyles: string[];
     
     if (isSelected) {
       newStyles = selectedStyles.filter(s => s !== styleLabel);
     } else {
       if (selectedStyles.length >= 5) {
         toast.warning("Máximo de 5 estilos permitido");
         return;
       }
       newStyles = [...selectedStyles, styleLabel];
     }
     
     setFormData(prev => ({
       ...prev,
       attributes: { ...prev.attributes, style: newStyles.join(', ') }
     }));
   };
 
   const removeStyle = (styleLabel: string) => {
     const newStyles = selectedStyles.filter(s => s !== styleLabel);
     setFormData(prev => ({
       ...prev,
       attributes: { ...prev.attributes, style: newStyles.join(', ') }
     }));
   };
 
   const handleDragOver = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(true);
   }, []);
 
   const handleDragLeave = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
   }, []);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
     
     const files = e.dataTransfer.files;
     if (files.length > 0) {
       processImageFile(files[0]);
     }
   }, []);
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (files && files.length > 0) {
       processImageFile(files[0]);
     }
   };
 
   const processImageFile = (file: File) => {
     if (!file.type.startsWith('image/')) {
       toast.error("Por favor, selecione um arquivo de imagem");
       return;
     }
     
     if (file.size > 5 * 1024 * 1024) {
       toast.error("Imagem muito grande. Máximo 5MB");
       return;
     }
     
     const reader = new FileReader();
     reader.onload = (e) => {
       const result = e.target?.result as string;
       setImagePreview(result);
       setFormData(prev => ({ ...prev, imageUrl: result }));
       toast.success("Imagem carregada!");
     };
     reader.readAsDataURL(file);
   };
 
   const removeImage = () => {
     setImagePreview(null);
     setFormData(prev => ({ ...prev, imageUrl: "" }));
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };
 
   const applyTemplate = (template: typeof characterTemplates[0]) => {
     setFormData({
       name: template.name,
       description: template.description,
       basePrompt: template.basePrompt,
       imageUrl: "",
       attributes: {
         age: template.attributes.age || "",
         gender: template.attributes.gender || "",
         style: template.attributes.style || "",
         features: template.attributes.features || [],
       },
     });
     setImagePreview(null);
     setShowTemplates(false);
     toast.success(`Template "${template.name}" aplicado!`);
   };

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
       <div className="flex items-center gap-1">
         <Button 
           variant="ghost" 
           size="sm" 
           className="h-8 gap-1.5 text-xs"
           onClick={() => setShowTemplates(!showTemplates)}
         >
           <Users className="w-3.5 h-3.5" />
           Templates
         </Button>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
           <X className="w-4 h-4" />
         </Button>
       </div>
      </div>
     
     {/* Templates Panel */}
     <AnimatePresence>
       {showTemplates && (
         <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: "auto", opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           className="border-b border-border overflow-hidden"
         >
           <div className="p-3">
             <p className="text-xs text-muted-foreground mb-2">Selecione um template para começar:</p>
             <div className="grid grid-cols-3 gap-2">
               {characterTemplates.map((template) => (
                 <button
                   key={template.id}
                   type="button"
                   onClick={() => applyTemplate(template)}
                   className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                 >
                   <span className="text-2xl block mb-1">{template.thumbnail}</span>
                   <span className="text-[10px] font-medium text-foreground group-hover:text-primary line-clamp-1">
                     {template.name}
                   </span>
                 </button>
               ))}
             </div>
           </div>
         </motion.div>
       )}
     </AnimatePresence>
      
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
          <Label htmlFor="style" className="text-xs flex items-center justify-between">
            <span>Estilo Visual</span>
            {selectedStyles.length > 0 && (
              <span className="text-[10px] text-muted-foreground">{selectedStyles.length}/5 selecionados</span>
            )}
          </Label>
          
          {/* Selected Styles Tags */}
          {selectedStyles.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {selectedStyles.map((style) => (
                <Badge 
                  key={style} 
                  variant="secondary" 
                  className="text-[10px] gap-1 pr-1 bg-primary/20 text-primary border-primary/30"
                >
                  {style}
                  <button
                    type="button"
                    onClick={() => removeStyle(style)}
                    className="ml-0.5 hover:bg-primary/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              className="w-full min-h-9 px-3 py-2 text-sm text-left bg-background border border-input rounded-md flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <span className="text-muted-foreground">
                {selectedStyles.length === 0 ? "Selecione até 5 estilos..." : "Adicionar mais estilos..."}
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
                                  toggleStyle(style.label);
                                  setStyleSearch("");
                                }}
                                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center justify-between hover:bg-accent transition-colors ${
                                  selectedStyles.includes(style.label) ? 'bg-primary/20 text-primary' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                    selectedStyles.includes(style.label) 
                                      ? 'bg-primary border-primary' 
                                      : 'border-muted-foreground/40'
                                  }`}>
                                    {selectedStyles.includes(style.label) && (
                                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                    )}
                                  </div>
                                  <span>{style.label}</span>
                                </div>
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
                                    toggleStyle(style.label);
                                  }}
                                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center justify-between hover:bg-accent transition-colors ${
                                    selectedStyles.includes(style.label) ? 'bg-primary/20 text-primary' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                      selectedStyles.includes(style.label) 
                                        ? 'bg-primary border-primary' 
                                        : 'border-muted-foreground/40'
                                    }`}>
                                      {selectedStyles.includes(style.label) && (
                                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                      )}
                                    </div>
                                    <span>{style.label}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Footer with count */}
                  <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      {selectedStyles.length}/5 selecionados
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2"
                      onClick={() => {
                        setStyleDropdownOpen(false);
                        setStyleSearch("");
                      }}
                    >
                      Fechar
                    </Button>
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
         
         {/* Image Preview or Upload Area */}
         {imagePreview ? (
           <div className="relative group">
             <img 
               src={imagePreview} 
               alt="Preview" 
               className="w-full h-32 object-cover rounded-lg border border-border"
             />
             <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
               <Button
                 type="button"
                 variant="secondary"
                 size="sm"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <Upload className="w-3.5 h-3.5 mr-1" />
                 Trocar
               </Button>
               <Button
                 type="button"
                 variant="destructive"
                 size="sm"
                 onClick={removeImage}
               >
                 <X className="w-3.5 h-3.5 mr-1" />
                 Remover
               </Button>
             </div>
           </div>
         ) : (
           <div
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             className={`
               relative h-28 border-2 border-dashed rounded-lg cursor-pointer
               flex flex-col items-center justify-center gap-2 transition-all
               ${isDragging 
                 ? 'border-primary bg-primary/10' 
                 : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
               }
             `}
           >
             <Image className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
             <div className="text-center">
               <p className="text-xs text-muted-foreground">
                 {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
               </p>
               <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG até 5MB</p>
             </div>
           </div>
         )}
         
         <input
           ref={fileInputRef}
           type="file"
           accept="image/*"
           onChange={handleFileSelect}
           className="hidden"
         />
         
         {/* URL Input as alternative */}
         <div className="flex gap-2 items-center">
           <span className="text-[10px] text-muted-foreground">ou cole uma URL:</span>
           <Input
             id="imageUrl"
             placeholder="https://..."
             value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
             onChange={(e) => {
               setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
               if (e.target.value) setImagePreview(e.target.value);
             }}
             className="h-7 text-xs flex-1"
           />
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
