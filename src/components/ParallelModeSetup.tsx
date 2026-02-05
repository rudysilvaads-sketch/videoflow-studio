 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Slider } from "@/components/ui/slider";
 import { Badge } from "@/components/ui/badge";
 import { 
   Layers, 
   ChevronLeft,
   Play,
   Info
 } from "lucide-react";
 import { toast } from "sonner";
 import { createParallelSession, ParallelSession } from "@/lib/parallelTabs";
 
 interface ParallelModeSetupProps {
   onBack: () => void;
   onSessionCreated: (session: ParallelSession) => void;
 }
 
 export function ParallelModeSetup({ onBack, onSessionCreated }: ParallelModeSetupProps) {
   const [promptsText, setPromptsText] = useState("");
   const [tabCount, setTabCount] = useState(3);
   const [downloadFolder, setDownloadFolder] = useState("LaCasaDark_Parallel");
 
   const prompts = promptsText
     .split('\n')
     .map(line => line.trim())
     .filter(line => line.length > 0);
 
   const promptsPerTab = Math.ceil(prompts.length / tabCount);
 
   const handleCreate = () => {
     if (prompts.length === 0) {
       toast.error("Adicione pelo menos um prompt");
       return;
     }
     
     if (prompts.length < tabCount) {
       toast.warning(`Você tem menos prompts (${prompts.length}) que abas (${tabCount}). Algumas abas ficarão vazias.`);
     }
     
     const session = createParallelSession(prompts, tabCount, downloadFolder);
     toast.success(`Sessão paralela criada com ${session.tabs.length} abas!`);
     onSessionCreated(session);
   };
 
   return (
     <div className="flex flex-col h-full">
       {/* Header */}
       <div className="flex items-center gap-2 p-3 border-b border-border">
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
           <ChevronLeft className="w-4 h-4" />
         </Button>
         <div className="flex items-center gap-2">
           <Layers className="w-4 h-4 text-primary" />
           <span className="font-semibold text-sm">Modo Paralelo</span>
         </div>
       </div>
 
       <div className="flex-1 overflow-y-auto p-3 space-y-4">
         {/* Info */}
         <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
           <div className="flex items-start gap-2">
             <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
             <div className="text-xs text-primary/90">
               <p className="font-medium mb-1">Processamento em Múltiplas Abas</p>
               <p>Abre várias abas do Google Flow simultaneamente, cada uma processando um conjunto de prompts. Ideal para acelerar a geração de muitos vídeos.</p>
             </div>
           </div>
         </div>
 
         {/* Prompts Input */}
         <div className="space-y-1.5">
           <div className="flex items-center justify-between">
             <Label className="text-xs">Prompts (um por linha)</Label>
             {prompts.length > 0 && (
               <Badge variant="secondary" className="text-[10px]">
                 {prompts.length} prompts
               </Badge>
             )}
           </div>
           <Textarea
             placeholder="Cole seus prompts aqui, um por linha...&#10;&#10;Exemplo:&#10;Um astronauta caminhando na lua&#10;Uma cidade futurista ao entardecer&#10;Um dragão voando sobre montanhas"
             value={promptsText}
             onChange={(e) => setPromptsText(e.target.value)}
             className="min-h-32 text-sm font-mono"
           />
         </div>
 
         {/* Tab Count */}
         <div className="space-y-3">
           <div className="flex items-center justify-between">
             <Label className="text-xs">Número de Abas</Label>
             <Badge variant="outline" className="text-xs font-mono">
               {tabCount} abas
             </Badge>
           </div>
           <Slider
             value={[tabCount]}
             onValueChange={([value]) => setTabCount(value)}
             min={2}
             max={10}
             step={1}
             className="w-full"
           />
           <div className="flex justify-between text-[10px] text-muted-foreground">
             <span>2 abas</span>
             <span>10 abas</span>
           </div>
         </div>
 
         {/* Distribution Preview */}
         {prompts.length > 0 && (
           <div className="p-3 rounded-lg bg-muted/50 border border-border">
             <p className="text-xs font-medium mb-2">Distribuição:</p>
             <div className="grid grid-cols-2 gap-2">
               {Array.from({ length: Math.min(tabCount, prompts.length) }).map((_, i) => {
                 const startIdx = i * promptsPerTab;
                 const endIdx = Math.min(startIdx + promptsPerTab, prompts.length);
                 const count = endIdx - startIdx;
                 
                 return count > 0 ? (
                   <div 
                     key={i} 
                     className="p-2 rounded bg-background border border-border text-center"
                   >
                     <p className="text-xs font-medium">Aba {i + 1}</p>
                     <p className="text-[10px] text-muted-foreground">
                       {count} prompt{count > 1 ? 's' : ''}
                     </p>
                   </div>
                 ) : null;
               })}
             </div>
           </div>
         )}
 
         {/* Download Folder */}
         <div className="space-y-1.5">
           <Label className="text-xs">Pasta de Download</Label>
           <Input
             value={downloadFolder}
             onChange={(e) => setDownloadFolder(e.target.value)}
             placeholder="Nome da pasta"
             className="h-9 text-sm"
           />
           <p className="text-[10px] text-muted-foreground">
             Cada aba salvará em uma subpasta: {downloadFolder}/tab-1, tab-2, etc.
           </p>
         </div>
       </div>
 
       {/* Footer */}
       <div className="p-3 border-t border-border">
         <Button 
           onClick={handleCreate} 
           variant="glow" 
           className="w-full"
           disabled={prompts.length === 0}
         >
           <Play className="w-4 h-4 mr-2" />
           Criar Sessão Paralela ({prompts.length} prompts em {Math.min(tabCount, prompts.length)} abas)
         </Button>
       </div>
     </div>
   );
 }