 import { motion } from "framer-motion";
 import { ListPlus, FolderPlus, Trash2, FolderInput } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 
 interface QueueActionsProps {
   folderName: string;
   onFolderNameChange: (name: string) => void;
   queueCount: number;
   promptCount: number;
   onAddToQueue: () => void;
   onManageQueue: () => void;
   onClearQueue: () => void;
   hasQueue: boolean;
 }
 
 export function QueueActions({
   folderName,
   onFolderNameChange,
   queueCount,
   promptCount,
   onAddToQueue,
   onManageQueue,
   onClearQueue,
   hasQueue,
 }: QueueActionsProps) {
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.25 }}
       className="space-y-3"
     >
       {/* Folder Name */}
       <div className="space-y-2">
         <Label className="text-xs font-semibold flex items-center gap-2 text-foreground/90">
           <div className="p-1.5 rounded-md bg-muted">
             <FolderInput className="w-3.5 h-3.5 text-muted-foreground" />
           </div>
           Pasta de Download
         </Label>
         <Input
           value={folderName}
           onChange={(e) => onFolderNameChange(e.target.value)}
           placeholder="MeuProjeto_Cenas"
           className="h-9 text-sm rounded-lg bg-card/50"
         />
       </div>
 
       {/* Action Buttons */}
       <div className="flex gap-2">
         <Button 
           variant="outline" 
           className="flex-1 h-9 text-xs gap-1.5 border-muted-foreground/20"
           onClick={onManageQueue}
         >
           <FolderPlus className="w-3.5 h-3.5" />
           Gerenciar ({queueCount})
         </Button>
         <Button 
           className="flex-1 h-9 text-xs gap-1.5 shadow-button"
           onClick={onAddToQueue}
           disabled={promptCount === 0}
         >
           <ListPlus className="w-3.5 h-3.5" />
           Adicionar à Fila
         </Button>
         <Button 
           variant="outline" 
           size="icon" 
           className="h-9 w-9 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
           onClick={onClearQueue}
           disabled={!hasQueue}
         >
           <Trash2 className="w-3.5 h-3.5" />
         </Button>
       </div>
     </motion.div>
   );
 }