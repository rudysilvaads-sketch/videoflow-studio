 import { motion, AnimatePresence } from "framer-motion";
 import { Clock, Copy, Trash2, FileText, Sparkles } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { toast } from "sonner";
 
 interface HistoryItem {
   id: string;
   prompt: string;
   timestamp: Date;
   characterName?: string;
 }
 
 interface HistoryTabProps {
   items: HistoryItem[];
   onClear: () => void;
 }
 
 export function HistoryTab({ items, onClear }: HistoryTabProps) {
   const copyPrompt = (prompt: string) => {
     navigator.clipboard.writeText(prompt);
     toast.success("Prompt copiado!");
   };
 
   const formatDate = (date: Date) => {
     const d = new Date(date);
     return d.toLocaleDateString('pt-BR', { 
       day: '2-digit', 
       month: '2-digit',
       hour: '2-digit',
       minute: '2-digit'
     });
   };
 
   if (items.length === 0) {
     return (
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="flex-1 flex flex-col items-center justify-center p-8"
       >
         <Clock className="w-12 h-12 text-muted-foreground/20 mb-4" />
         <p className="text-sm text-muted-foreground font-medium">Nenhum histórico</p>
         <p className="text-xs text-muted-foreground/60 mt-1 text-center">
           Os prompts enviados aparecerão aqui
         </p>
       </motion.div>
     );
   }
 
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="p-4 space-y-3"
     >
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Clock className="w-4 h-4 text-muted-foreground" />
           <span className="text-xs font-semibold">Histórico de Prompts</span>
           <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
         </div>
         <Button
           variant="ghost"
           size="sm"
           className="h-7 text-[10px] text-destructive hover:text-destructive gap-1"
           onClick={onClear}
         >
           <Trash2 className="w-3 h-3" />
           Limpar
         </Button>
       </div>
 
       {/* History Items */}
       <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin pr-1">
         <AnimatePresence mode="popLayout">
           {items.map((item, index) => (
             <motion.div
               key={item.id}
               layout
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ delay: index * 0.05 }}
               className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
             >
               <div className="flex items-start justify-between gap-2 mb-2">
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                   <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                   <span className="text-[10px] text-muted-foreground truncate">
                     {formatDate(item.timestamp)}
                   </span>
                   {item.characterName && (
                     <Badge variant="outline" className="text-[9px] shrink-0">
                       {item.characterName}
                     </Badge>
                   )}
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => copyPrompt(item.prompt)}
                 >
                   <Copy className="w-3 h-3" />
                 </Button>
               </div>
               <p className="text-xs text-foreground/80 line-clamp-3 font-mono">
                 {item.prompt}
               </p>
             </motion.div>
           ))}
         </AnimatePresence>
       </div>
     </motion.div>
   );
 }