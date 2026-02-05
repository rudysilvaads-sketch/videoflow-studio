 import { motion } from "framer-motion";
 import { 
   Download, 
   Upload, 
   FileText, 
   FolderOpen, 
   Trash2,
   RefreshCw,
   Sparkles,
   Wand2
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { toast } from "sonner";
 
 interface ToolsTabProps {
   onExportQueue: () => void;
   onDownloadAllVideos: () => void;
   onConfigureFolder: () => void;
   onImportCharacter: () => void;
   onClearLogs: () => void;
   hasCompletedVideos: boolean;
   hasQueue: boolean;
 }
 
 export function ToolsTab({
   onExportQueue,
   onDownloadAllVideos,
   onConfigureFolder,
   onImportCharacter,
   onClearLogs,
   hasCompletedVideos,
   hasQueue,
 }: ToolsTabProps) {
   const tools = [
     {
       id: 'export-queue',
       label: 'Exportar Fila',
       description: 'Salvar prompts como arquivo .txt',
       icon: FileText,
       color: 'primary',
       onClick: onExportQueue,
       disabled: !hasQueue,
     },
     {
       id: 'download-videos',
       label: 'Baixar Todos os Vídeos',
       description: 'Download de vídeos concluídos',
       icon: Download,
       color: 'accent',
       onClick: onDownloadAllVideos,
       disabled: !hasCompletedVideos,
     },
     {
       id: 'configure-folder',
       label: 'Configurar Pasta',
       description: 'Abrir configurações de download',
       icon: FolderOpen,
       color: 'muted',
       onClick: onConfigureFolder,
       disabled: false,
     },
     {
       id: 'import-character',
       label: 'Importar Personagem',
       description: 'Carregar personagem de arquivo JSON',
       icon: Upload,
       color: 'muted',
       onClick: onImportCharacter,
       disabled: false,
     },
     {
       id: 'clear-logs',
       label: 'Limpar Logs',
       description: 'Remover histórico de atividades',
       icon: Trash2,
       color: 'destructive',
       onClick: onClearLogs,
       disabled: false,
     },
   ];
 
   const getColorClasses = (color: string) => {
     switch (color) {
       case 'primary': return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
       case 'accent': return 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20';
       case 'destructive': return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
       default: return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
     }
   };
 
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="p-4 space-y-3"
     >
       {/* Header */}
       <div className="flex items-center gap-2 mb-4">
         <Wand2 className="w-4 h-4 text-primary" />
         <span className="text-xs font-semibold">Ferramentas Úteis</span>
       </div>
 
       {/* Tools Grid */}
       <div className="space-y-2">
         {tools.map((tool, index) => (
           <motion.button
             key={tool.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: index * 0.05 }}
             onClick={tool.onClick}
             disabled={tool.disabled}
             className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed ${getColorClasses(tool.color)}`}
           >
             <div className={`p-2 rounded-lg ${tool.color === 'destructive' ? 'bg-destructive/20' : tool.color === 'accent' ? 'bg-accent/20' : tool.color === 'primary' ? 'bg-primary/20' : 'bg-muted'}`}>
               <tool.icon className="w-4 h-4" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-medium">{tool.label}</p>
               <p className="text-[10px] opacity-60">{tool.description}</p>
             </div>
           </motion.button>
         ))}
       </div>
 
       {/* Tips */}
       <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
         <div className="flex items-start gap-2">
           <Sparkles className="w-4 h-4 text-primary mt-0.5" />
           <div>
             <p className="text-xs font-medium">Dica Pro</p>
             <p className="text-[10px] text-muted-foreground mt-0.5">
               Use o modo paralelo para processar até 4 vídeos simultaneamente em abas diferentes!
             </p>
           </div>
         </div>
       </div>
     </motion.div>
   );
 }