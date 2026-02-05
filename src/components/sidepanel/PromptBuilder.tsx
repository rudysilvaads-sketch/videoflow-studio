 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { 
   Wand2, 
   Copy, 
   Check, 
   Sparkles,
   Volume2,
   Cloud,
   Camera,
   ChevronDown,
   Play
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from "@/components/ui/collapsible";
 import { Scenario } from "@/types/series";
 import { cn } from "@/lib/utils";
 
 interface PromptBuilderProps {
   characterPrompt: string;
   isCharacterLocked: boolean;
   selectedScenario: Scenario | null;
   onGeneratePrompt: (prompt: string) => void;
 }
 
 export function PromptBuilder({ 
   characterPrompt, 
   isCharacterLocked,
   selectedScenario,
   onGeneratePrompt 
 }: PromptBuilderProps) {
   const [action, setAction] = useState("");
   const [sound, setSound] = useState("");
   const [weather, setWeather] = useState("");
   const [customDetails, setCustomDetails] = useState("");
   const [showAdvanced, setShowAdvanced] = useState(false);
   const [copied, setCopied] = useState(false);
   const [generatedPrompt, setGeneratedPrompt] = useState("");
 
   useEffect(() => {
     if (selectedScenario) {
       // Auto-select first suggestions
       if (selectedScenario.suggestedActions?.[0]) {
         setAction(selectedScenario.suggestedActions[0]);
       }
       if (selectedScenario.suggestedSounds?.[0]) {
         setSound(selectedScenario.suggestedSounds[0]);
       }
       if (selectedScenario.suggestedWeather?.[0]) {
         setWeather(selectedScenario.suggestedWeather[0]);
       }
     }
   }, [selectedScenario]);
 
   const buildPrompt = () => {
     const parts: string[] = [];
 
     // Visual style prefix
     parts.push("Estilo cinematográfico pós-apocalíptico, tons dessaturados, atmosfera 'The Last of Us'.");
 
     // Character (if locked)
     if (isCharacterLocked && characterPrompt) {
       parts.push(characterPrompt);
     }
 
     // Scenario
     if (selectedScenario) {
       parts.push(selectedScenario.environment);
       parts.push(selectedScenario.details);
     }
 
     // Action
     if (action) {
       parts.push(`Ação: ${action}.`);
     }
 
     // Weather/Time
     if (weather) {
       parts.push(`Clima/Hora: ${weather}.`);
     }
 
     // Custom details
     if (customDetails.trim()) {
       parts.push(customDetails);
     }
 
     // Sound design (ASMR)
     if (sound) {
       parts.push(`[SFX: ${sound}]`);
     }
 
     // Camera work
     parts.push("Câmera: plano médio seguindo o personagem, movimentos lentos e deliberados. Sem diálogos, foco total nos sons ambiente.");
 
     const finalPrompt = parts.join(" ");
     setGeneratedPrompt(finalPrompt);
     return finalPrompt;
   };
 
   const handleGenerate = () => {
     const prompt = buildPrompt();
     onGeneratePrompt(prompt);
   };
 
   const copyPrompt = () => {
     navigator.clipboard.writeText(generatedPrompt);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
 
   return (
     <div className="space-y-4">
       {/* Scenario Info */}
       {selectedScenario && (
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20"
         >
           <div className="flex items-center gap-2 mb-2">
             <span className="text-xl">{selectedScenario.icon}</span>
             <div>
               <p className="text-sm font-medium">{selectedScenario.name}</p>
               <p className="text-[10px] text-muted-foreground">{selectedScenario.description}</p>
             </div>
           </div>
         </motion.div>
       )}
 
       {/* Quick Options */}
       <div className="grid grid-cols-2 gap-3">
         {/* Action */}
         <div className="space-y-1.5">
           <Label className="text-xs flex items-center gap-1">
             <Camera className="w-3 h-3 text-primary" />
             Ação
           </Label>
           <Select value={action} onValueChange={setAction}>
             <SelectTrigger className="h-8 text-xs">
               <SelectValue placeholder="Selecione..." />
             </SelectTrigger>
             <SelectContent>
               {selectedScenario?.suggestedActions?.map((a, i) => (
                 <SelectItem key={i} value={a} className="text-xs">
                   {a}
                 </SelectItem>
               )) || (
                 <>
                   <SelectItem value="Caminhando" className="text-xs">Caminhando</SelectItem>
                   <SelectItem value="Observando" className="text-xs">Observando</SelectItem>
                   <SelectItem value="Trabalhando" className="text-xs">Trabalhando</SelectItem>
                 </>
               )}
             </SelectContent>
           </Select>
         </div>
 
         {/* Weather */}
         <div className="space-y-1.5">
           <Label className="text-xs flex items-center gap-1">
             <Cloud className="w-3 h-3 text-muted-foreground" />
             Clima/Hora
           </Label>
           <Select value={weather} onValueChange={setWeather}>
             <SelectTrigger className="h-8 text-xs">
               <SelectValue placeholder="Selecione..." />
             </SelectTrigger>
             <SelectContent>
               {selectedScenario?.suggestedWeather?.map((w, i) => (
                 <SelectItem key={i} value={w} className="text-xs">
                   {w}
                 </SelectItem>
               )) || (
                 <>
                   <SelectItem value="Dia nublado" className="text-xs">Dia nublado</SelectItem>
                   <SelectItem value="Noite" className="text-xs">Noite</SelectItem>
                   <SelectItem value="Amanhecer" className="text-xs">Amanhecer</SelectItem>
                 </>
               )}
             </SelectContent>
           </Select>
         </div>
       </div>
 
       {/* Sound (ASMR) */}
       <div className="space-y-1.5">
         <Label className="text-xs flex items-center gap-1">
           <Volume2 className="w-3 h-3 text-accent" />
           Sons ASMR
         </Label>
         <Select value={sound} onValueChange={setSound}>
           <SelectTrigger className="h-8 text-xs">
             <SelectValue placeholder="Selecione o som principal..." />
           </SelectTrigger>
           <SelectContent>
             {selectedScenario?.suggestedSounds?.map((s, i) => (
               <SelectItem key={i} value={s} className="text-xs">
                 {s}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Advanced Options */}
       <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
         <CollapsibleTrigger asChild>
           <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
             <ChevronDown className={cn(
               "w-3 h-3 transition-transform",
               showAdvanced && "rotate-180"
             )} />
             Opções avançadas
           </button>
         </CollapsibleTrigger>
         <CollapsibleContent className="pt-2">
           <div className="space-y-1.5">
             <Label className="text-xs">Detalhes Adicionais</Label>
             <Textarea
               value={customDetails}
               onChange={(e) => setCustomDetails(e.target.value)}
               placeholder="Adicione detalhes específicos da cena..."
               className="min-h-[60px] text-xs"
             />
           </div>
         </CollapsibleContent>
       </Collapsible>
 
       {/* Generate Button */}
       <Button 
         onClick={handleGenerate}
         className="w-full gap-2"
         disabled={!selectedScenario}
       >
         <Wand2 className="w-4 h-4" />
         Gerar Prompt Completo
       </Button>
 
       {/* Generated Prompt Preview */}
       {generatedPrompt && (
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="p-3 rounded-xl bg-muted/50 border border-border space-y-2"
         >
           <div className="flex items-center justify-between">
             <Label className="text-xs flex items-center gap-1">
               <Sparkles className="w-3 h-3 text-primary" />
               Prompt Gerado
             </Label>
             <Badge variant="outline" className="text-[9px] h-4">
               {generatedPrompt.length} chars
             </Badge>
           </div>
           
           <p className="text-[10px] font-mono text-muted-foreground leading-relaxed max-h-32 overflow-y-auto">
             {generatedPrompt}
           </p>
 
           <div className="flex gap-2">
             <Button
               variant="outline"
               size="sm"
               className="flex-1 h-7 text-[10px]"
               onClick={copyPrompt}
             >
               {copied ? (
                 <>
                   <Check className="w-3 h-3 mr-1" />
                   Copiado!
                 </>
               ) : (
                 <>
                   <Copy className="w-3 h-3 mr-1" />
                   Copiar
                 </>
               )}
             </Button>
             <Button
               size="sm"
               className="flex-1 h-7 text-[10px] gap-1"
               onClick={() => onGeneratePrompt(generatedPrompt)}
             >
               <Play className="w-3 h-3" />
               Usar no Flow
             </Button>
           </div>
         </motion.div>
       )}
     </div>
   );
 }