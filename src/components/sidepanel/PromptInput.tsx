 import { motion } from "framer-motion";
 import { FileText, Upload, Sparkles } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 
 interface PromptInputProps {
   value: string;
   onChange: (value: string) => void;
   onImportFile: () => void;
   promptCount: number;
 }
 
 export function PromptInput({
   value,
   onChange,
   onImportFile,
   promptCount,
 }: PromptInputProps) {
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.2 }}
       className="space-y-3"
     >
       {/* Header */}
       <div className="flex items-center justify-between">
         <Label className="text-xs font-semibold flex items-center gap-2 text-foreground/90">
           <div className="p-1.5 rounded-md bg-accent/10">
             <FileText className="w-3.5 h-3.5 text-accent" />
           </div>
           Lista de Prompts
           {promptCount > 0 && (
             <Badge className="text-[10px] px-1.5 py-0 h-4 bg-accent/20 text-accent border-0">
               {promptCount} cena{promptCount > 1 ? 's' : ''}
             </Badge>
           )}
         </Label>
         <Button 
           variant="outline" 
           size="sm" 
           className="h-7 text-[10px] gap-1.5 border-dashed"
           onClick={onImportFile}
         >
           <Upload className="w-3 h-3" />
           Importar .txt
         </Button>
       </div>
 
       {/* Textarea */}
       <div className="relative">
         <Textarea
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder={`🎬 Primeira cena - descrição detalhada...
 Continue descrevendo a mesma cena aqui.
 
 🎬 Segunda cena - nova descrição...
 Com detalhes visuais e cinematográficos.
 
 🎬 Terceira cena - e assim por diante...
 
 💡 Dica: Linhas em branco separam as cenas!`}
           className="min-h-[140px] text-sm font-mono resize-none rounded-xl bg-card/50 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/40"
         />
         
         {/* Empty state overlay */}
         {value.trim().length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 flex items-center justify-center pointer-events-none"
           >
             <div className="text-center">
               <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
             </div>
           </motion.div>
         )}
       </div>
       
       {/* Helper text */}
       <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
         <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
         Cada bloco separado por linha em branco = uma cena
       </p>
     </motion.div>
   );
 }