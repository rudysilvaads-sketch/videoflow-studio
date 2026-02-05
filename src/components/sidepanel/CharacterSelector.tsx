 import { motion, Reorder } from "framer-motion";
 import { User, Plus, X, GripVertical, Sparkles } from "lucide-react";
 import { Character } from "@/types/character";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 
 interface CharacterSelectorProps {
   characters: Character[];
   selectedCharacterIds: string[];
   onSelectionChange: (ids: string[]) => void;
   onCreateNew: () => void;
 }
 
 export function CharacterSelector({
   characters,
   selectedCharacterIds,
   onSelectionChange,
   onCreateNew,
 }: CharacterSelectorProps) {
   const selectedCharacters = characters.filter(c => selectedCharacterIds.includes(c.id));
 
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.1 }}
       className="space-y-3"
     >
       {/* Header */}
       <div className="flex items-center justify-between">
         <Label className="text-xs font-semibold flex items-center gap-2 text-foreground/90">
           <div className="p-1.5 rounded-md bg-primary/10">
             <User className="w-3.5 h-3.5 text-primary" />
           </div>
           Personagens
           {selectedCharacterIds.length > 0 && (
             <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
               {selectedCharacterIds.length} selecionado{selectedCharacterIds.length > 1 ? 's' : ''}
             </Badge>
           )}
         </Label>
         <Button
           variant="ghost"
           size="sm"
           className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
           onClick={() => onSelectionChange([])}
           disabled={selectedCharacterIds.length === 0}
         >
           Limpar
         </Button>
       </div>
 
       {/* Character List */}
       <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
         <div className="max-h-28 overflow-y-auto scrollbar-thin p-2 space-y-1">
           {characters.length === 0 ? (
             <div className="text-center py-4">
               <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
               <p className="text-xs text-muted-foreground">Nenhum personagem criado</p>
             </div>
           ) : (
             characters.map(char => (
               <motion.label 
                 key={char.id} 
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.99 }}
                 className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                   selectedCharacterIds.includes(char.id) 
                     ? 'bg-primary/15 border border-primary/40 shadow-sm' 
                     : 'hover:bg-muted/50 border border-transparent'
                 }`}
               >
                 <input
                   type="checkbox"
                   checked={selectedCharacterIds.includes(char.id)}
                   onChange={(e) => {
                     if (e.target.checked) {
                       onSelectionChange([...selectedCharacterIds, char.id]);
                     } else {
                       onSelectionChange(selectedCharacterIds.filter(id => id !== char.id));
                     }
                   }}
                   className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                 />
                 {char.imageUrl ? (
                   <img 
                     src={char.imageUrl} 
                     alt="" 
                     className="w-7 h-7 rounded-lg object-cover ring-1 ring-border" 
                   />
                 ) : (
                   <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                     <User className="w-3.5 h-3.5 text-muted-foreground" />
                   </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <span className="text-xs font-medium truncate block">{char.name}</span>
                   {char.attributes?.style && (
                     <span className="text-[10px] text-muted-foreground">{char.attributes.style}</span>
                   )}
                 </div>
               </motion.label>
             ))
           )}
         </div>
         
         {/* Create New Button */}
         <div className="p-2 border-t border-border bg-muted/30">
           <Button 
             variant="ghost" 
             size="sm"
             className="w-full h-8 text-xs gap-1.5 justify-center hover:bg-primary/10 hover:text-primary"
             onClick={onCreateNew}
           >
             <Plus className="w-3.5 h-3.5" />
             Criar Novo Personagem
           </Button>
         </div>
       </div>
 
       {/* Selected Characters Reorder */}
       {selectedCharacters.length > 1 && (
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
           className="p-3 rounded-xl bg-primary/5 border border-primary/20"
         >
           <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5">
             <GripVertical className="w-3 h-3" />
             Arraste para reordenar (primeiro = principal)
           </p>
           <Reorder.Group 
             axis="y" 
             values={selectedCharacterIds} 
             onReorder={onSelectionChange}
             className="space-y-1"
           >
             {selectedCharacterIds.map((charId, index) => {
               const char = characters.find(c => c.id === charId);
               if (!char) return null;
               return (
                 <Reorder.Item 
                   key={charId}
                   value={charId}
                   whileDrag={{ 
                     scale: 1.02, 
                     boxShadow: "0 8px 20px -5px rgba(0,0,0,0.3)",
                     zIndex: 50
                   }}
                   className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border group cursor-grab active:cursor-grabbing"
                 >
                   <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                   <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                     {index + 1}
                   </Badge>
                   {char.imageUrl && (
                     <img src={char.imageUrl} alt="" className="w-5 h-5 rounded-md object-cover pointer-events-none" />
                   )}
                   <span className="text-xs flex-1 truncate pointer-events-none">{char.name}</span>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive"
                     onClick={(e) => {
                       e.stopPropagation();
                       onSelectionChange(selectedCharacterIds.filter(id => id !== charId));
                     }}
                   >
                     <X className="w-3 h-3" />
                   </Button>
                 </Reorder.Item>
               );
             })}
           </Reorder.Group>
         </motion.div>
       )}
     </motion.div>
   );
 }