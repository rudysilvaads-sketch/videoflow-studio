 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Copy, Check, FileText, Minimize2, Maximize2 } from "lucide-react";
 import { CinematographySettings } from "@/types/character";
 import { generateCinematographyPrompt, generateCompactPrompt } from "@/lib/cinematographyPrompt";
 import { toast } from "sonner";
 
 interface CinematographyPreviewProps {
   characterName: string;
   basePrompt: string;
   settings: CinematographySettings;
 }
 
 export function CinematographyPreview({ 
   characterName, 
   basePrompt, 
   settings 
 }: CinematographyPreviewProps) {
   const [copied, setCopied] = useState(false);
   const [useCompact, setUseCompact] = useState(false);
   
   const fullPrompt = generateCinematographyPrompt(characterName, basePrompt, settings);
   const compactPrompt = generateCompactPrompt(basePrompt, settings);
   
   const currentPrompt = useCompact ? compactPrompt : fullPrompt;
   const isEmpty = !currentPrompt || currentPrompt === "PROJECT: Character-consistent cinematic video, same protagonist across all shots.";
   
   const handleCopy = async () => {
     try {
       await navigator.clipboard.writeText(currentPrompt);
       setCopied(true);
       toast.success("Prompt copiado!");
       setTimeout(() => setCopied(false), 2000);
     } catch (err) {
       toast.error("Erro ao copiar");
     }
   };
   
   if (isEmpty) {
     return (
       <div className="mt-4 p-4 border border-dashed border-border rounded-lg text-center">
         <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
         <p className="text-xs text-muted-foreground">
           Preencha os campos cinematográficos para gerar o prompt
         </p>
       </div>
     );
   }
   
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="mt-4 border border-border rounded-lg overflow-hidden bg-muted/30"
     >
       {/* Header */}
       <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
         <div className="flex items-center gap-2">
           <FileText className="w-3.5 h-3.5 text-primary" />
           <span className="text-xs font-medium">Prompt Gerado</span>
           <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
             {currentPrompt.length} chars
           </span>
         </div>
         <div className="flex items-center gap-1">
           <Button
             type="button"
             variant="ghost"
             size="sm"
             className="h-6 px-2 text-[10px] gap-1"
             onClick={() => setUseCompact(!useCompact)}
           >
             {useCompact ? (
               <>
                 <Maximize2 className="w-3 h-3" />
                 Completo
               </>
             ) : (
               <>
                 <Minimize2 className="w-3 h-3" />
                 Compacto
               </>
             )}
           </Button>
           <Button
             type="button"
             variant="ghost"
             size="sm"
             className="h-6 px-2 text-[10px] gap-1"
             onClick={handleCopy}
           >
             {copied ? (
               <>
                 <Check className="w-3 h-3 text-accent" />
                 Copiado!
               </>
             ) : (
               <>
                 <Copy className="w-3 h-3" />
                 Copiar
               </>
             )}
           </Button>
         </div>
       </div>
       
       {/* Content */}
       <ScrollArea className="h-48">
         <pre className="p-3 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
           {currentPrompt}
         </pre>
       </ScrollArea>
     </motion.div>
   );
 }