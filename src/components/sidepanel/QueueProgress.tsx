 import { motion, AnimatePresence } from "framer-motion";
 import { 
   Play, 
   Square, 
   Loader2, 
   Check, 
   AlertCircle, 
   Send, 
   Download,
   RotateCcw,
   Layers,
   FolderOpen
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Badge } from "@/components/ui/badge";
 import { BatchSession, BatchPromptItem } from "@/lib/batchQueue";
 
 interface QueueProgressProps {
   batchSession: BatchSession | null;
   isRunning: boolean;
   progress: { completed: number; total: number; percentage: number };
   onStart: () => void;
   onStop: () => void;
   onReset: () => void;
   onParallelMode: () => void;
   onRetryItem: (item: BatchPromptItem) => void;
 }
 
 export function QueueProgress({
   batchSession,
   isRunning,
   progress,
   onStart,
   onStop,
   onReset,
   onParallelMode,
   onRetryItem,
 }: QueueProgressProps) {
   const getStatusIcon = (status: BatchPromptItem['status']) => {
     switch (status) {
       case 'pending': return <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />;
       case 'sending': return <Send className="w-3 h-3 text-primary animate-pulse" />;
       case 'processing': return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
       case 'downloading': return <Download className="w-3 h-3 text-accent animate-pulse" />;
       case 'completed': return <Check className="w-3 h-3 text-accent" />;
       case 'error': return <AlertCircle className="w-3 h-3 text-destructive" />;
     }
   };
 
   const getStatusColor = (status: BatchPromptItem['status']) => {
     switch (status) {
       case 'processing': return 'bg-primary/10 border-primary/30';
       case 'downloading': return 'bg-accent/10 border-accent/30';
       case 'completed': return 'bg-accent/20 border-accent/40';
       case 'error': return 'bg-destructive/10 border-destructive/30';
       default: return 'bg-card border-border';
     }
   };
 
   if (!batchSession || batchSession.items.length === 0) {
     return (
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="text-center py-8"
       >
         <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
         <p className="text-sm text-muted-foreground">Nenhuma cena na fila</p>
         <p className="text-xs text-muted-foreground/60 mt-1">
           Adicione prompts acima para começar
         </p>
       </motion.div>
     );
   }
 
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.3 }}
       className="space-y-4"
     >
       {/* Progress Bar */}
       <div className="space-y-2">
         <div className="flex items-center justify-between text-xs">
           <span className="font-medium flex items-center gap-2">
             {isRunning ? (
               <>
                 <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                 <span className="text-primary">Processando...</span>
               </>
             ) : (
               <span className="text-muted-foreground">Pronto para iniciar</span>
             )}
           </span>
           <span className="text-muted-foreground font-mono">
             {progress.completed}/{progress.total}
           </span>
         </div>
         <div className="relative">
           <Progress value={progress.percentage} className="h-2" />
           {progress.percentage > 0 && (
             <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground"
             >
               {Math.round(progress.percentage)}
             </motion.div>
           )}
         </div>
       </div>
 
       {/* Action Buttons */}
       <div className="flex gap-2">
         <Button 
           className="flex-1 h-10 gap-2 shadow-button"
           onClick={onStart}
           disabled={isRunning}
         >
           <Play className="w-4 h-4" />
           Iniciar Fila
         </Button>
         <Button 
           variant="destructive"
           className="flex-1 h-10 gap-2"
           onClick={onStop}
           disabled={!isRunning}
         >
           <Square className="w-4 h-4" />
           Parar
         </Button>
       </div>
 
       {/* Parallel Mode */}
       <Button 
         variant="outline"
         className="w-full h-9 gap-2 text-xs border-dashed border-primary/40 text-primary hover:bg-primary/5"
         onClick={onParallelMode}
         disabled={isRunning}
       >
         <Layers className="w-4 h-4" />
         Modo Paralelo (Múltiplas Abas)
       </Button>
 
       {/* Reset button when stuck */}
       {(isRunning || batchSession.items.some(i => i.status === 'processing' || i.status === 'sending')) && (
         <Button
           variant="ghost"
           size="sm"
           className="w-full h-7 text-[10px] text-destructive/80 hover:text-destructive hover:bg-destructive/10"
           onClick={onReset}
         >
           <RotateCcw className="w-3 h-3 mr-1.5" />
           Resetar itens travados
         </Button>
       )}
 
       {/* Queue Items */}
       <div className="space-y-2">
         <div className="flex items-center justify-between">
           <span className="text-xs font-medium text-muted-foreground">
             Fila de Processamento
           </span>
           <Badge variant="outline" className="text-[10px]">
             {batchSession.items.length} itens
           </Badge>
         </div>
         
         <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
           <AnimatePresence mode="popLayout">
             {batchSession.items.map((item) => (
               <motion.div 
                 key={item.id}
                 layout
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${getStatusColor(item.status)}`}
               >
                 <div className="mt-0.5 shrink-0">{getStatusIcon(item.status)}</div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-1.5">
                     <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                       {String(item.sceneNumber).padStart(2, '0')}
                     </Badge>
                     {item.status === 'completed' && (
                       <span className="text-accent text-[10px]">✓ Concluído</span>
                     )}
                     {item.status === 'processing' && (
                       <span className="text-primary text-[10px]">Gerando...</span>
                     )}
                   </div>
                   <p className="text-muted-foreground line-clamp-1 mt-1">{item.prompt}</p>
                   {item.errorMessage && (
                     <p className="text-destructive text-[10px] mt-1">{item.errorMessage}</p>
                   )}
                 </div>
                 {item.status === 'error' && (
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-6 w-6 shrink-0 hover:bg-destructive/10"
                     onClick={() => onRetryItem(item)}
                   >
                     <RotateCcw className="w-3 h-3" />
                   </Button>
                 )}
               </motion.div>
             ))}
           </AnimatePresence>
         </div>
       </div>
     </motion.div>
   );
 }