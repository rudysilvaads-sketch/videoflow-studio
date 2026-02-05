 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";
 import { Wand2, ChevronDown, Check, Sparkles, Loader2 } from "lucide-react";
 import { CinematographySettings } from "@/types/character";
 import { 
   cinematographyPresets, 
   presetCategories, 
   getPresetsByCategory,
   PresetCategory 
 } from "@/data/cinematographyPresets";
 import { toast } from "sonner";
 
 interface CinematographyPresetsSelectorProps {
   onApplyPreset: (settings: Partial<CinematographySettings>) => void;
   onGenerateWithAI: (description: string) => Promise<void>;
   isGenerating?: boolean;
 }
 
 export function CinematographyPresetsSelector({ 
   onApplyPreset, 
   onGenerateWithAI,
   isGenerating = false 
 }: CinematographyPresetsSelectorProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState<PresetCategory>("Todos");
   const [aiInput, setAiInput] = useState("");
   const [showAiInput, setShowAiInput] = useState(false);
   
   const filteredPresets = getPresetsByCategory(selectedCategory);
   
   const handleApplyPreset = (settings: Partial<CinematographySettings>) => {
     onApplyPreset(settings);
     setIsOpen(false);
     toast.success("Preset aplicado!");
   };
   
   const handleGenerateAI = async () => {
     if (!aiInput.trim()) {
       toast.error("Descreva o estilo que deseja");
       return;
     }
     await onGenerateWithAI(aiInput);
     setAiInput("");
     setShowAiInput(false);
     setIsOpen(false);
   };
   
   return (
     <div className="mb-3">
       <Button
         type="button"
         variant="outline"
         size="sm"
         className="w-full h-9 justify-between text-xs"
         onClick={() => setIsOpen(!isOpen)}
       >
         <div className="flex items-center gap-2">
           <Wand2 className="w-3.5 h-3.5 text-primary" />
           <span>Presets & IA</span>
         </div>
         <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
       </Button>
       
       <AnimatePresence>
         {isOpen && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="overflow-hidden"
           >
             <div className="mt-2 border border-border rounded-lg bg-muted/20 overflow-hidden">
               {/* AI Generator */}
               <div className="p-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                 <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-4 h-4 text-primary" />
                   <span className="text-xs font-medium">Gerar com IA</span>
                 </div>
                 
                 {showAiInput ? (
                   <div className="space-y-2">
                     <textarea
                       placeholder="Descreva o estilo cinematográfico que deseja... Ex: 'Cena de ação em Hong Kong à noite com chuva e neons'"
                       value={aiInput}
                       onChange={(e) => setAiInput(e.target.value)}
                       className="w-full h-20 p-2 text-xs rounded-md border border-border bg-background resize-none"
                       disabled={isGenerating}
                     />
                     <div className="flex gap-2">
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="flex-1 h-7 text-[10px]"
                         onClick={() => setShowAiInput(false)}
                         disabled={isGenerating}
                       >
                         Cancelar
                       </Button>
                       <Button
                         type="button"
                         size="sm"
                         className="flex-1 h-7 text-[10px] gap-1"
                         onClick={handleGenerateAI}
                         disabled={isGenerating || !aiInput.trim()}
                       >
                         {isGenerating ? (
                           <>
                             <Loader2 className="w-3 h-3 animate-spin" />
                             Gerando...
                           </>
                         ) : (
                           <>
                             <Sparkles className="w-3 h-3" />
                             Gerar
                           </>
                         )}
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <Button
                     type="button"
                     variant="secondary"
                     size="sm"
                     className="w-full h-8 text-xs gap-1.5"
                     onClick={() => setShowAiInput(true)}
                   >
                     <Sparkles className="w-3.5 h-3.5" />
                     Descrever estilo para IA gerar
                   </Button>
                 )}
               </div>
               
               {/* Category Tabs */}
               <div className="p-2 border-b border-border">
                 <ScrollArea className="w-full">
                   <div className="flex gap-1 pb-1">
                     {presetCategories.map((category) => (
                       <Button
                         key={category}
                         type="button"
                         variant={selectedCategory === category ? "default" : "ghost"}
                         size="sm"
                         className="h-6 text-[10px] px-2 whitespace-nowrap shrink-0"
                         onClick={() => setSelectedCategory(category)}
                       >
                         {category}
                       </Button>
                     ))}
                   </div>
                 </ScrollArea>
               </div>
               
               {/* Presets Grid */}
               <ScrollArea className="h-48">
                 <div className="p-2 grid grid-cols-2 gap-2">
                   {filteredPresets.map((preset) => (
                     <button
                       key={preset.id}
                       type="button"
                       onClick={() => handleApplyPreset(preset.settings)}
                       className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                     >
                       <div className="flex items-start gap-2">
                         <span className="text-lg">{preset.icon}</span>
                         <div className="flex-1 min-w-0">
                           <p className="text-[11px] font-medium text-foreground group-hover:text-primary truncate">
                             {preset.name}
                           </p>
                           <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">
                             {preset.description}
                           </p>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </ScrollArea>
               
               {/* Footer */}
               <div className="p-2 border-t border-border bg-muted/30">
                 <p className="text-[10px] text-muted-foreground text-center">
                   {filteredPresets.length} presets disponíveis
                 </p>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 }